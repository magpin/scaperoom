import { createClient } from '@supabase/supabase-js'
import { generateRoomCode } from '../utils/codes'
import type { PlayerProgressPayload, RoomPlayer, RoomSession } from '../types/game'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const SUPABASE_REQUEST_TIMEOUT_MS = 12000

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

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

function loadLocalDb(): LocalDatabase {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { rooms: [], players: [], progress: [] }
  }

  try {
    return JSON.parse(raw) as LocalDatabase
  } catch {
    return { rooms: [], players: [], progress: [] }
  }
}

function saveLocalDb(db: LocalDatabase): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
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
  return hasSupabaseConfig ? 'supabase' : 'local'
}

export async function createRoomWithHost(hostName: string): Promise<{
  room: RoomSession
  host: RoomPlayer
}> {
  const normalizedHost = hostName.trim()
  if (!normalizedHost) {
    throw new Error('El nombre del anfitrion es obligatorio.')
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
  } catch {
    return createLocalRoomWithHost(normalizedHost)
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
  } catch {
    return joinLocalRoomByCode(normalizedCode, normalizedName)
  }
}

export async function listPlayers(roomId: string): Promise<RoomPlayer[]> {
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
