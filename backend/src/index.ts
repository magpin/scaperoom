import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from '@supabase/supabase-js'
import { existsSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

type RoomStatus = 'waiting' | 'in_progress' | 'finished'

const port = Number(process.env.PORT ?? 4000)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const currentDir = dirname(fileURLToPath(import.meta.url))

const staticDirCandidates = [
  process.env.FRONTEND_DIST_PATH,
  resolve(currentDir, '../public'),
  resolve(currentDir, '../../frontend/dist'),
].filter((dir): dir is string => Boolean(dir))

const staticDir = staticDirCandidates.find((dir) => existsSync(join(dir, 'index.html')))

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend environment')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: frontendUrl.split(',').map((item) => item.trim()),
    credentials: true,
  }),
)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl.split(',').map((item) => item.trim()),
    credentials: true,
  },
})

function mapRoom(row: { room_id: string; room_code: string; status: RoomStatus }) {
  return {
    roomId: row.room_id,
    roomCode: row.room_code,
    status: row.status,
  }
}

function mapPlayer(row: {
  player_id: string
  player_name: string
  is_host: boolean
  current_level: number
  score: number
  completed: boolean
}) {
  return {
    playerId: row.player_id,
    playerName: row.player_name,
    isHost: row.is_host,
    currentLevel: row.current_level,
    score: row.score,
    completed: row.completed,
  }
}

function generateRoomCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

async function generateUniqueRoomCode(): Promise<string> {
  for (let i = 0; i < 10; i += 1) {
    const roomCode = generateRoomCode()
    const { data, error } = await supabase
      .from('rooms')
      .select('room_id')
      .eq('room_code', roomCode)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return roomCode
    }
  }

  throw new Error('No se pudo generar un codigo de sala unico')
}

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'scape-backend' })
})

app.post('/rooms/create', async (req, res) => {
  try {
    const hostName = String(req.body?.hostName ?? '').trim()
    if (!hostName) {
      return res.status(400).json({ error: 'El nombre del anfitrion es obligatorio.' })
    }

    const roomCode = await generateUniqueRoomCode()

    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({ room_code: roomCode, host_name: hostName, status: 'waiting' })
      .select('room_id, room_code, status')
      .single()

    if (roomError || !roomData) {
      return res.status(500).json({ error: roomError?.message || 'No fue posible crear la sala.' })
    }

    const { data: hostData, error: hostError } = await supabase
      .from('players')
      .insert({
        room_id: roomData.room_id,
        player_name: hostName,
        is_host: true,
        current_level: 0,
        score: 0,
        completed: false,
      })
      .select('player_id, player_name, is_host, current_level, score, completed')
      .single()

    if (hostError || !hostData) {
      return res.status(500).json({ error: hostError?.message || 'No fue posible registrar anfitrion.' })
    }

    io.to(roomData.room_id).emit('room_updated', mapRoom(roomData))
    io.to(roomData.room_id).emit('player_joined', mapPlayer(hostData))

    return res.status(200).json({ room: mapRoom(roomData), host: mapPlayer(hostData) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible crear la sala.'
    return res.status(500).json({ error: message })
  }
})

app.post('/rooms/join', async (req, res) => {
  try {
    const roomCode = String(req.body?.roomCode ?? '').trim().toUpperCase()
    const playerName = String(req.body?.playerName ?? '').trim()

    if (!roomCode || !playerName) {
      return res.status(400).json({ error: 'Debes ingresar codigo y nombre.' })
    }

    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('room_id, room_code, status')
      .eq('room_code', roomCode)
      .maybeSingle()

    if (roomError) {
      return res.status(500).json({ error: roomError.message })
    }

    if (!roomData) {
      return res.status(404).json({ error: 'No existe una sala con ese codigo.' })
    }

    if (roomData.status !== 'waiting' && roomData.status !== 'in_progress') {
      return res.status(400).json({ error: 'La sala ya no esta disponible.' })
    }

    const { data: existing, error: existingError } = await supabase
      .from('players')
      .select('player_id')
      .eq('room_id', roomData.room_id)
      .eq('player_name', playerName)
      .maybeSingle()

    if (existingError) {
      return res.status(500).json({ error: existingError.message })
    }

    if (existing) {
      return res.status(409).json({ error: 'Ya existe un jugador con ese nombre en la sala.' })
    }

    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: roomData.room_id,
        player_name: playerName,
        is_host: false,
        current_level: 0,
        score: 0,
        completed: false,
      })
      .select('player_id, player_name, is_host, current_level, score, completed')
      .single()

    if (playerError || !playerData) {
      return res.status(500).json({ error: playerError?.message || 'No fue posible unir al jugador.' })
    }

    io.to(roomData.room_id).emit('player_joined', mapPlayer(playerData))

    return res.status(200).json({ room: mapRoom(roomData), player: mapPlayer(playerData) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible unirse a la sala.'
    return res.status(500).json({ error: message })
  }
})

app.get('/rooms/:roomId/players', async (req, res) => {
  try {
    const roomId = String(req.params.roomId)
    const { data, error } = await supabase
      .from('players')
      .select('player_id, player_name, is_host, current_level, score, completed')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ players: (data ?? []).map(mapPlayer) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible listar jugadores.'
    return res.status(500).json({ error: message })
  }
})

app.get('/rooms/:roomId/status', async (req, res) => {
  try {
    const roomId = String(req.params.roomId)
    const { data, error } = await supabase
      .from('rooms')
      .select('status')
      .eq('room_id', roomId)
      .maybeSingle()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Sala no encontrada.' })
    }

    return res.status(200).json({ status: data.status as RoomStatus })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible consultar estado de sala.'
    return res.status(500).json({ error: message })
  }
})

app.post('/rooms/:roomId/start', async (req, res) => {
  try {
    const roomId = String(req.params.roomId)
    const { error } = await supabase
      .from('rooms')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('room_id', roomId)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    io.to(roomId).emit('room_started', { roomId, status: 'in_progress' })
    return res.status(200).json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible iniciar sala.'
    return res.status(500).json({ error: message })
  }
})

app.post('/progress/save', async (req, res) => {
  try {
    const payload = req.body as {
      playerId: string
      roomId: string
      currentLevel: number
      score: number
      keyFragments: string[]
      completed: boolean
      elapsedSeconds: number
      levelStatus: Record<number, 'pending' | 'correct' | 'incorrect'>
    }

    const { error } = await supabase.from('player_progress').upsert(
      {
        player_id: payload.playerId,
        room_id: payload.roomId,
        story_seen: payload.currentLevel >= 0,
        reading_seen: payload.currentLevel >= 1,
        level_1_status: payload.levelStatus[1],
        level_2_status: payload.levelStatus[2],
        level_3_status: payload.levelStatus[3],
        level_4_status: payload.levelStatus[4],
        key_fragments: payload.keyFragments,
        final_code: payload.completed ? payload.keyFragments.join('-') : null,
        score: payload.score,
        elapsed_seconds: payload.elapsedSeconds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'player_id,room_id' },
    )

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const { error: playerError } = await supabase
      .from('players')
      .update({
        current_level: payload.currentLevel,
        score: payload.score,
        completed: payload.completed,
        last_active_at: new Date().toISOString(),
      })
      .eq('player_id', payload.playerId)

    if (playerError) {
      return res.status(500).json({ error: playerError.message })
    }

    if (payload.completed) {
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'finished', finished_at: new Date().toISOString() })
        .eq('room_id', payload.roomId)

      if (roomError) {
        return res.status(500).json({ error: roomError.message })
      }
    }

    io.to(payload.roomId).emit('progress_updated', {
      roomId: payload.roomId,
      playerId: payload.playerId,
      currentLevel: payload.currentLevel,
      score: payload.score,
      completed: payload.completed,
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible guardar progreso.'
    return res.status(500).json({ error: message })
  }
})

io.on('connection', (socket) => {
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId)
  })

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId)
  })
})

if (staticDir) {
  app.use(express.static(staticDir))

  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end()
  })

  app.get('*', (_req, res) => {
    res.sendFile(join(staticDir, 'index.html'))
  })
}

httpServer.listen(port, () => {
  console.log(`Backend running on port ${port}${staticDir ? ` with static dir ${staticDir}` : ''}`)
})
