import { createClient } from '@supabase/supabase-js'
import { generateRoomCode } from '../utils/codes'
import type { PlayerProgressPayload, RoomPlayer, RoomSession } from '../types/game'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined
const SUPABASE_REQUEST_TIMEOUT_MS = 2500

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
const hasBackendConfig = Boolean(backendUrl)

function withTimeout<T>(promiseLike: PromiseLike<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`Tiempo de espera agotado al ${label}. Revisa VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y politicas RLS.`))
    }, SUPABASE_REQUEST_TIMEOUT_MS)

    Promise.resolve(promiseLike)
      .then((value) => {
        window.clearTimeout(timeout)
        resolve(value)
      })
      .catch((error) => {
        window.clearTimeout(timeout)
        reject(error)
      })
  })
}

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL no configurado')
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    })

    const payload = (await response.json()) as { error?: string }

    if (!response.ok) {
      throw new Error(payload.error || `Backend error ${response.status}`)
    }

    return payload as T
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error de red con backend'
    throw new Error(message)
  } finally {
    window.clearTimeout(timeout)
  }
}

const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null

type LocalDatabase = {
  rooms: Array<RoomSession & { hostName: string; createdAt: string; startedAt?: string }>
  players: Array<RoomPlayer & { roomId: string; joinedAt: string }>
  progress: PlayerProgressPayload[]
}

const STORAGE_KEY = 'escape_room_local_db'
let memoryDbFallback: LocalDatabase = { rooms: [], players: [], progress: [] }

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStorage(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Ignore storage write errors and keep memory fallback as source of truth.
  }
}

function loadLocalDb(): LocalDatabase {
  const raw = readStorage()
  if (!raw) {
    return {
      rooms: [...memoryDbFallback.rooms],
      players: [...memoryDbFallback.players],
      progress: [...memoryDbFallback.progress],
    }
  }

  try {
    const parsed = JSON.parse(raw) as LocalDatabase
    memoryDbFallback = {
      rooms: [...parsed.rooms],
      players: [...parsed.players],
      progress: [...parsed.progress],
    }
    return parsed
  } catch {
    return {
      rooms: [...memoryDbFallback.rooms],
      players: [...memoryDbFallback.players],
      progress: [...memoryDbFallback.progress],
    }
  }
}

function saveLocalDb(db: LocalDatabase): void {
  memoryDbFallback = {
    rooms: [...db.rooms],
    players: [...db.players],
    progress: [...db.progress],
  }
  writeStorage(JSON.stringify(db))
}

function createLocalRoomWithHost(hostName: string): { room: RoomSession; host: RoomPlayer } {
  const db = loadLocalDb()
  let roomCode = generateRoomCode()

  while (db.rooms.some((room) => room.roomCode === roomCode)) {
    roomCode = generateRoomCode()
  }

  const roomId = crypto.randomUUID()
  const playerId = crypto.randomUUID()

  const room: RoomSession = {
    roomId,
    roomCode,
    status: 'waiting',
  }

  const host: RoomPlayer = {
    playerId,
    playerName: hostName,
    isHost: true,
    currentLevel: 0,
    score: 0,
    completed: false,
  }

  db.rooms.push({ ...room, hostName, createdAt: new Date().toISOString() })
  db.players.push({ ...host, roomId, joinedAt: new Date().toISOString() })
  saveLocalDb(db)

  return { room, host }
}

function joinLocalRoomByCode(roomCode: string, playerName: string): { room: RoomSession; player: RoomPlayer } {
  const db = loadLocalDb()
  const room = db.rooms.find((item) => item.roomCode === roomCode)

  if (!room) {
    throw new Error('No existe una sala con ese codigo.')
  }

  if (room.status !== 'waiting' && room.status !== 'in_progress') {
    throw new Error('La sala no esta disponible para unirse.')
  }

  const player: RoomPlayer = {
    playerId: crypto.randomUUID(),
    playerName,
    isHost: false,
    currentLevel: 0,
    score: 0,
    completed: false,
  }

  db.players.push({ ...player, roomId: room.roomId, joinedAt: new Date().toISOString() })
  saveLocalDb(db)

  return {
    room: {
      roomId: room.roomId,
      roomCode: room.roomCode,
      status: room.status,
    },
    player,
  }
}

function listLocalPlayers(roomId: string): RoomPlayer[] {
  const db = loadLocalDb()

  return db.players
    .filter((player) => player.roomId === roomId)
    .map((player) => ({
      playerId: player.playerId,
      playerName: player.playerName,
      isHost: player.isHost,
      currentLevel: player.currentLevel,
      score: player.score,
      completed: player.completed,
    }))
}

function startLocalRoom(roomId: string): void {
  const db = loadLocalDb()
  const room = db.rooms.find((item) => item.roomId === roomId)

  if (!room) {
    throw new Error('Sala no encontrada.')
  }

  room.status = 'in_progress'
  room.startedAt = new Date().toISOString()
  saveLocalDb(db)
}

function getLocalRoomStatus(roomId: string): RoomSession['status'] {
  const db = loadLocalDb()
  const room = db.rooms.find((item) => item.roomId === roomId)

  if (!room) {
    throw new Error('Sala no encontrada.')
  }

  return room.status
}

function saveLocalProgress(payload: PlayerProgressPayload): void {
  const db = loadLocalDb()
  const existing = db.progress.find(
    (item) => item.playerId === payload.playerId && item.roomId === payload.roomId,
  )

  if (existing) {
    Object.assign(existing, payload)
  } else {
    db.progress.push(payload)
  }

  const player = db.players.find((item) => item.playerId === payload.playerId)
  if (player) {
    player.currentLevel = payload.currentLevel
    player.score = payload.score
    player.completed = payload.completed
  }

  const room = db.rooms.find((item) => item.roomId === payload.roomId)
  if (room && payload.completed) {
    room.status = 'finished'
  }

  saveLocalDb(db)
}

export function persistenceMode(): 'supabase' | 'local' {
  return hasSupabaseConfig || hasBackendConfig ? 'supabase' : 'local'
}

export async function createRoomWithHost(hostName: string): Promise<{
  room: RoomSession
  host: RoomPlayer
}> {
  const normalizedHost = hostName.trim()
  if (!normalizedHost) {
    throw new Error('El nombre del anfitrion es obligatorio.')
  }

  if (hasBackendConfig) {
    const response = await backendRequest<{ room: RoomSession; host: RoomPlayer }>('/rooms/create', {
      method: 'POST',
      body: JSON.stringify({ hostName: normalizedHost }),
    })
    return response
  }

  if (!supabase) {
    return createLocalRoomWithHost(normalizedHost)
  }

  try {
    const roomCode = generateRoomCode()

    const { data: roomData, error: roomError } = await withTimeout(
      supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          host_name: normalizedHost,
          status: 'waiting',
        })
        .select('room_id, room_code, status')
        .single(),
      'crear la sala en Supabase',
    )

    if (roomError || !roomData) {
      throw new Error(roomError?.message || 'No fue posible crear la sala.')
    }

    const { data: playerData, error: playerError } = await withTimeout(
      supabase
        .from('players')
        .insert({
          room_id: roomData.room_id,
          player_name: normalizedHost,
          is_host: true,
          current_level: 0,
          score: 0,
          completed: false,
        })
        .select('player_id, player_name, is_host, current_level, score, completed')
        .single(),
      'registrar al anfitrion en Supabase',
    )

    if (playerError || !playerData) {
      throw new Error(playerError?.message || 'No fue posible registrar al anfitrion.')
    }

    return {
      room: {
        roomId: roomData.room_id,
        roomCode: roomData.room_code,
        status: roomData.status,
      },
      host: {
        playerId: playerData.player_id,
        playerName: playerData.player_name,
        isHost: playerData.is_host,
        currentLevel: playerData.current_level,
        score: playerData.score,
        completed: playerData.completed,
      },
    }
  } catch (error) {
    const details = error instanceof Error ? error.message : 'error desconocido'
    throw new Error(`No fue posible crear la sala en Supabase (${details}). Verifica RLS/permisos y variables VITE_* en Vercel.`)
  }
}

export async function joinRoomByCode(roomCode: string, playerName: string): Promise<{
  room: RoomSession
  player: RoomPlayer
}> {
  const normalizedCode = roomCode.trim().toUpperCase()
  const normalizedName = playerName.trim()

  if (!normalizedCode || !normalizedName) {
    throw new Error('Debes ingresar codigo y nombre.')
  }

  if (hasBackendConfig) {
    const response = await backendRequest<{ room: RoomSession; player: RoomPlayer }>('/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ roomCode: normalizedCode, playerName: normalizedName }),
    })
    return response
  }

  if (!supabase) {
    return joinLocalRoomByCode(normalizedCode, normalizedName)
  }

  try {
    const { data: roomData, error: roomError } = await withTimeout(
      supabase
        .from('rooms')
        .select('room_id, room_code, status')
        .eq('room_code', normalizedCode)
        .single(),
      'consultar la sala en Supabase',
    )

    if (roomError || !roomData) {
      throw new Error('No se encontro la sala.')
    }

    if (roomData.status !== 'waiting' && roomData.status !== 'in_progress') {
      throw new Error('La sala ya no esta disponible.')
    }

    const { data: playerData, error: playerError } = await withTimeout(
      supabase
        .from('players')
        .insert({
          room_id: roomData.room_id,
          player_name: normalizedName,
          is_host: false,
          current_level: 0,
          score: 0,
          completed: false,
        })
        .select('player_id, player_name, is_host, current_level, score, completed')
        .single(),
      'registrar jugador en Supabase',
    )

    if (playerError || !playerData) {
      throw new Error(playerError?.message || 'No fue posible unir al jugador.')
    }

    return {
      room: {
        roomId: roomData.room_id,
        roomCode: roomData.room_code,
        status: roomData.status,
      },
      player: {
        playerId: playerData.player_id,
        playerName: playerData.player_name,
        isHost: playerData.is_host,
        currentLevel: playerData.current_level,
        score: playerData.score,
        completed: playerData.completed,
      },
    }
  } catch (error) {
    const details = error instanceof Error ? error.message : 'error desconocido'
    throw new Error(`No se pudo unir en Supabase (${details}). Si la sala fue creada en modo local, solo existe en el navegador del anfitrion.`)
  }
}

export async function listPlayers(roomId: string): Promise<RoomPlayer[]> {
  if (hasBackendConfig) {
    const response = await backendRequest<{ players: RoomPlayer[] }>(`/rooms/${roomId}/players`)
    return response.players
  }

  if (!supabase) {
    return listLocalPlayers(roomId)
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('players')
        .select('player_id, player_name, is_host, current_level, score, completed')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true }),
      'listar jugadores en Supabase',
    )

    if (error || !data) {
      throw new Error(error?.message || 'No fue posible listar jugadores.')
    }

    return data.map((player) => ({
      playerId: player.player_id,
      playerName: player.player_name,
      isHost: player.is_host,
      currentLevel: player.current_level,
      score: player.score,
      completed: player.completed,
    }))
  } catch {
    return listLocalPlayers(roomId)
  }
}

export async function startRoom(roomId: string): Promise<void> {
  if (hasBackendConfig) {
    await backendRequest<{ ok: boolean }>(`/rooms/${roomId}/start`, { method: 'POST' })
    return
  }

  if (!supabase) {
    startLocalRoom(roomId)
    return
  }

  try {
    const { error } = await withTimeout(
      supabase
        .from('rooms')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('room_id', roomId),
      'iniciar la sala en Supabase',
    )

    if (error) {
      throw new Error(error.message)
    }
  } catch {
    startLocalRoom(roomId)
  }
}

export async function getRoomStatus(roomId: string): Promise<RoomSession['status']> {
  if (hasBackendConfig) {
    const response = await backendRequest<{ status: RoomSession['status'] }>(`/rooms/${roomId}/status`)
    return response.status
  }

  if (!supabase) {
    return getLocalRoomStatus(roomId)
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('rooms')
        .select('status')
        .eq('room_id', roomId)
        .single(),
      'consultar estado de sala en Supabase',
    )

    if (error || !data) {
      throw new Error(error?.message || 'No fue posible consultar la sala.')
    }

    return data.status
  } catch {
    return getLocalRoomStatus(roomId)
  }
}

export async function saveProgress(payload: PlayerProgressPayload): Promise<void> {
  if (hasBackendConfig) {
    await backendRequest<{ ok: boolean }>('/progress/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return
  }

  if (!supabase) {
    saveLocalProgress(payload)
    return
  }

  const levelStatus = payload.levelStatus

  try {
    const { error } = await withTimeout(
      supabase.from('player_progress').upsert(
        {
          player_id: payload.playerId,
          room_id: payload.roomId,
          story_seen: payload.currentLevel >= 0,
          reading_seen: payload.currentLevel >= 1,
          level_1_status: levelStatus[1],
          level_2_status: levelStatus[2],
          level_3_status: levelStatus[3],
          level_4_status: levelStatus[4],
          key_fragments: payload.keyFragments,
          final_code: payload.completed ? payload.keyFragments.join('-') : null,
          score: payload.score,
          elapsed_seconds: payload.elapsedSeconds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'player_id,room_id' },
      ),
      'guardar progreso en Supabase',
    )

    if (error) {
      throw new Error(error.message)
    }

    const { error: playerError } = await withTimeout(
      supabase
        .from('players')
        .update({
          current_level: payload.currentLevel,
          score: payload.score,
          completed: payload.completed,
          last_active_at: new Date().toISOString(),
        })
        .eq('player_id', payload.playerId),
      'actualizar jugador en Supabase',
    )

    if (playerError) {
      throw new Error(playerError.message)
    }

    if (payload.completed) {
      const { error: roomError } = await withTimeout(
        supabase
          .from('rooms')
          .update({ status: 'finished', finished_at: new Date().toISOString() })
          .eq('room_id', payload.roomId),
        'cerrar sala en Supabase',
      )

      if (roomError) {
        throw new Error(roomError.message)
      }
    }
  } catch {
    saveLocalProgress(payload)
  }
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

type RoomChangeCallback = (payload: any) => void
type PlayerChangeCallback = (payload: any) => void

const activeSubscriptions = new Map<string, any>()

/**
 * Suscribirse a cambios en tiempo real de una sala (status, jugadores)
 * Se dispara cuando cambia room.status o se agregan/modifican jugadores
 */
export function subscribeToRoomChanges(
  roomId: string,
  onRoomChange: RoomChangeCallback,
  onPlayersChange: PlayerChangeCallback,
): () => void {
  if (!supabase) {
    console.warn('Supabase no configurado, realtime no disponible')
    return () => {}
  }

  const key = `room-${roomId}`

  // Si ya existe suscripción, retorna función para desuscribirse
  if (activeSubscriptions.has(key)) {
    return () => {
      const sub = activeSubscriptions.get(key)
      if (sub) {
        supabase.removeChannel(sub)
        activeSubscriptions.delete(key)
      }
    }
  }

  // Crear channel para cambios en rooms y players
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('[Realtime] Room cambió:', payload)
        onRoomChange(payload)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('[Realtime] Players cambió:', payload)
        onPlayersChange(payload)
      },
    )
    .subscribe((status) => {
      console.log(`[Realtime] Subscription status: ${status}`)
    })

  activeSubscriptions.set(key, channel)

  // Retornar función desuscripción
  return () => {
    if (supabase && activeSubscriptions.has(key)) {
      supabase.removeChannel(channel)
      activeSubscriptions.delete(key)
    }
  }
}

/**
 * Suscribirse a cambios de progreso de un jugador
 */
export function subscribeToProgressChanges(
  playerId: string,
  roomId: string,
  callback: (payload: any) => void,
): () => void {
  if (!supabase) {
    return () => {}
  }

  const key = `progress-${playerId}-${roomId}`

  if (activeSubscriptions.has(key)) {
    return () => {
      const sub = activeSubscriptions.get(key)
      if (sub) {
        supabase.removeChannel(sub)
        activeSubscriptions.delete(key)
      }
    }
  }

  const channel = supabase
    .channel(`progress:${playerId}:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'player_progress',
        filter: `player_id=eq.${playerId}`,
      },
      (payload) => {
        console.log('[Realtime] Progress cambió:', payload)
        callback(payload)
      },
    )
    .subscribe()

  activeSubscriptions.set(key, channel)

  return () => {
    if (supabase && activeSubscriptions.has(key)) {
      supabase.removeChannel(channel)
      activeSubscriptions.delete(key)
    }
  }
}

/**
 * Limpiar todas las suscripciones (para cuando el usuario sale de la sala)
 */
export function unsubscribeFromAll(): void {
  activeSubscriptions.forEach((channel) => {
    if (supabase) {
      supabase.removeChannel(channel)
    }
  })
  activeSubscriptions.clear()
}
