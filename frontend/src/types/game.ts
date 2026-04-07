export type LevelType = 'literal' | 'inferencial' | 'critico' | 'aplicado'

export interface QuestionOption {
  id: string
  text: string
}

export interface ReadingQuestion {
  id: number
  levelType: LevelType
  levelLabel: string
  prompt: string
  options: QuestionOption[]
  correctOptionId: string
  explanation: string
  incorrectFeedback: string
  keyFragment: string
}

export interface EscapeRoomContent {
  title: string
  missionTitle: string
  story: string
  readingTitle: string
  readingText: string
  questions: ReadingQuestion[]
}

export interface RoomPlayer {
  playerId: string
  playerName: string
  isHost: boolean
  currentLevel: number
  score: number
  completed: boolean
}

export interface RoomSession {
  roomId: string
  roomCode: string
  status: 'waiting' | 'in_progress' | 'finished'
}

export interface PlayerProgressPayload {
  playerId: string
  roomId: string
  roomCode: string
  currentLevel: number
  score: number
  keyFragments: string[]
  completed: boolean
  elapsedSeconds: number
  levelStatus: Record<number, 'pending' | 'correct' | 'incorrect'>
}
