import { useEffect, useMemo, useState } from 'react'
import { escapeRoomContent } from './data/escapeRoom'
import {
  createRoomWithHost,
  getRoomStatus,
  joinRoomByCode,
  listPlayers,
  persistenceMode,
  saveProgress,
  startRoom,
} from './lib/supabase'
import { buildFinalCode } from './utils/codes'
import { secondsBetween } from './utils/timing'
import type { PlayerProgressPayload, RoomPlayer, RoomSession } from './types/game'

// Screens
import { HomeScreen } from './screens/HomeScreen'
import { IntroScreen } from './screens/IntroScreen'
import { CreateRoomScreen } from './screens/CreateRoomScreen'
import { JoinRoomScreen } from './screens/JoinRoomScreen'
import { LobbyScreen } from './screens/LobbyScreen'
import { StoryScreen } from './screens/StoryScreen'
import { ReadingScreen } from './screens/ReadingScreen'
import { QuestionScreen } from './screens/QuestionScreen'
import { ResultScreen } from './screens/ResultScreen'

// Styles
import './styles/variables.css'
import './styles/components.css'
import './styles/screens/home.css'
import './styles/screens/room.css'
import './styles/screens/game.css'
import './styles/screens/result.css'
import './App.css'

type Screen =
  | 'intro'
  | 'home'
  | 'create'
  | 'join'
  | 'lobby'
  | 'story'
  | 'reading'
  | 'question'
  | 'result'

type Feedback = {
  kind: 'correct' | 'incorrect'
  message: string
} | null

function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [room, setRoom] = useState<RoomSession | null>(null)
  const [player, setPlayer] = useState<RoomPlayer | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 })
  const [keyFragments, setKeyFragments] = useState<string[]>([])
  const [levelStatus, setLevelStatus] = useState<Record<number, 'pending' | 'correct' | 'incorrect'>>({
    1: 'pending',
    2: 'pending',
    3: 'pending',
    4: 'pending',
  })
  const [gameStartedAt, setGameStartedAt] = useState<string | null>(null)
  const [questionStartedAt, setQuestionStartedAt] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const content = escapeRoomContent
  const currentQuestion = content.questions[questionIndex]
  const mode = persistenceMode()

  const finalCode = useMemo(() => buildFinalCode(keyFragments), [keyFragments])

  // Live timer effect
  useEffect(() => {
    if (!gameStartedAt || screen === 'result') {
      return
    }

    const interval = setInterval(() => {
      const now = new Date().toISOString()
      setElapsedSeconds(secondsBetween(gameStartedAt, now))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStartedAt, screen])

  // Lobby sync effect
  useEffect(() => {
    if (!room || screen !== 'lobby') {
      return
    }

    let cancelled = false

    const syncLobby = async () => {
      try {
        const [roomStatus, members] = await Promise.all([
          getRoomStatus(room.roomId),
          listPlayers(room.roomId),
        ])

        if (cancelled) {
          return
        }

        setPlayers(members)
        setRoom((prev) => (prev ? { ...prev, status: roomStatus } : prev))

        if (roomStatus === 'in_progress' && !player?.isHost) {
          setScreen('story')
          if (!gameStartedAt) {
            setGameStartedAt(new Date().toISOString())
          }
        }
      } catch {
        if (!cancelled) {
          setErrorMessage('No fue posible sincronizar el lobby en este momento.')
        }
      }
    }

    void syncLobby()
    const timer = window.setInterval(() => {
      void syncLobby()
    }, 3000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [room, screen, player, gameStartedAt])

  async function persistProgress(next: Partial<PlayerProgressPayload>) {
    if (!room || !player) {
      return
    }

    const payload: PlayerProgressPayload = {
      playerId: player.playerId,
      roomId: room.roomId,
      roomCode: room.roomCode,
      currentLevel: next.currentLevel ?? questionIndex,
      score: next.score ?? score,
      keyFragments: next.keyFragments ?? keyFragments,
      completed: next.completed ?? false,
      elapsedSeconds: next.elapsedSeconds ?? elapsedSeconds,
      levelStatus: next.levelStatus ?? levelStatus,
    }

    try {
      await saveProgress(payload)
    } catch {
      setErrorMessage('Persistencia no disponible temporalmente. El juego sigue en modo local.')
    }
  }

  async function handleCreateRoom(hostName: string) {
    setIsBusy(true)
    setErrorMessage(null)
    try {
      const { room: newRoom, host } = await createRoomWithHost(hostName)
      setRoom(newRoom)
      setPlayer(host)
      setPlayers([host])
      setScreen('lobby')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la sala.'
      setErrorMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  async function handleJoinRoom(roomCode: string, playerName: string) {
    setIsBusy(true)
    setErrorMessage(null)
    try {
      const { room: joinedRoom, player: joinedPlayer } = await joinRoomByCode(roomCode, playerName)
      const roomPlayers = await listPlayers(joinedRoom.roomId)
      setRoom(joinedRoom)
      setPlayer(joinedPlayer)
      setPlayers(roomPlayers)
      setScreen(joinedRoom.status === 'in_progress' ? 'story' : 'lobby')
      if (joinedRoom.status === 'in_progress') {
        setGameStartedAt(new Date().toISOString())
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo unir a la sala.'
      setErrorMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  async function handleStartGame() {
    if (!room) {
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    try {
      await startRoom(room.roomId)
      setRoom((prev) => (prev ? { ...prev, status: 'in_progress' } : prev))
      const nowIso = new Date().toISOString()
      setGameStartedAt(nowIso)
      setScreen('story')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar la partida.'
      setErrorMessage(message)
    } finally {
      setIsBusy(false)
    }
  }

  function handleReadingContinue() {
    const nowIso = new Date().toISOString()
    setQuestionStartedAt(nowIso)
    setScreen('question')
    void persistProgress({ currentLevel: 1 })
  }

  function calculateQuestionPoints(attemptNumber: number): number {
    const base = 100
    const attemptPenalty = Math.max(0, (attemptNumber - 1) * 20)
    const elapsedForQuestion = questionStartedAt
      ? secondsBetween(questionStartedAt, new Date().toISOString())
      : 0
    const speedBonus = elapsedForQuestion <= 30 ? 20 : 0
    return Math.max(30, base - attemptPenalty + speedBonus)
  }

  function handleSubmitAnswer() {
    if (!currentQuestion || !selectedOptionId) {
      setErrorMessage('Debes seleccionar una opcion antes de responder.')
      return
    }

    const nextAttempts = {
      ...attempts,
      [currentQuestion.id]: (attempts[currentQuestion.id] ?? 0) + 1,
    }
    setAttempts(nextAttempts)

    const isCorrect = selectedOptionId === currentQuestion.correctOptionId

    if (!isCorrect) {
      const incorrectStatus = {
        ...levelStatus,
        [currentQuestion.id]: 'incorrect' as const,
      }
      setLevelStatus(incorrectStatus)
      setFeedback({ kind: 'incorrect', message: currentQuestion.incorrectFeedback })
      setSelectedOptionId(null)
      void persistProgress({
        currentLevel: currentQuestion.id,
        levelStatus: incorrectStatus,
      })
      return
    }

    const earned = calculateQuestionPoints(nextAttempts[currentQuestion.id])
    const nextScore = score + earned
    const nextLevelStatus = {
      ...levelStatus,
      [currentQuestion.id]: 'correct' as const,
    }
    const nextFragments = keyFragments.includes(currentQuestion.keyFragment)
      ? keyFragments
      : [...keyFragments, currentQuestion.keyFragment]

    setScore(nextScore)
    setLevelStatus(nextLevelStatus)
    setKeyFragments(nextFragments)
    setFeedback({ kind: 'correct', message: currentQuestion.explanation })

    const isFinalLevel = questionIndex === content.questions.length - 1
    const nowIso = new Date().toISOString()
    const totalElapsed = gameStartedAt ? secondsBetween(gameStartedAt, nowIso) : 0
    setElapsedSeconds(totalElapsed)

    if (isFinalLevel) {
      setScreen('result')
      void persistProgress({
        currentLevel: 4,
        score: nextScore,
        keyFragments: nextFragments,
        completed: true,
        elapsedSeconds: totalElapsed,
        levelStatus: nextLevelStatus,
      })
      return
    }

    void persistProgress({
      currentLevel: currentQuestion.id,
      score: nextScore,
      keyFragments: nextFragments,
      levelStatus: nextLevelStatus,
      elapsedSeconds: totalElapsed,
    })
  }

  function handleNextLevel() {
    const nextIndex = questionIndex + 1
    setQuestionIndex(nextIndex)
    setSelectedOptionId(null)
    setFeedback(null)
    setQuestionStartedAt(new Date().toISOString())
  }

  function resetToHome() {
    setScreen('home')
    setRoom(null)
    setPlayer(null)
    setPlayers([])
    setQuestionIndex(0)
    setSelectedOptionId(null)
    setFeedback(null)
    setScore(0)
    setAttempts({ 1: 0, 2: 0, 3: 0, 4: 0 })
    setKeyFragments([])
    setLevelStatus({ 1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending' })
    setGameStartedAt(null)
    setQuestionStartedAt(null)
    setElapsedSeconds(0)
    setErrorMessage(null)
  }

  async function copyRoomCode() {
    if (!room) {
      return
    }

    try {
      await navigator.clipboard.writeText(room.roomCode)
      setErrorMessage('Codigo de sala copiado al portapapeles.')
      window.setTimeout(() => setErrorMessage(null), 1500)
    } catch {
      setErrorMessage('No se pudo copiar el codigo automaticamente.')
    }
  }

  const isIntroScreen = screen === 'intro'

  return (
    <div className={`app-shell ${isIntroScreen ? 'app-shell--intro' : ''}`}>
      {/* Error Banner */}
      {errorMessage && (
        <div className={`banner ${errorMessage.includes('copiado') ? 'banner--success' : 'banner--error'}`}>
          {errorMessage}
        </div>
      )}

      <main className={`main-content ${isIntroScreen ? 'main-content--intro' : ''}`}>
        {screen === 'intro' && (
          <IntroScreen onFinished={() => setScreen('home')} />
        )}

        {screen === 'home' && (
          <HomeScreen
            content={content}
            persistenceMode={mode}
            onCreateRoom={() => setScreen('create')}
            onJoinRoom={() => setScreen('join')}
          />
        )}

        {screen === 'create' && (
          <CreateRoomScreen
            onCreateRoom={handleCreateRoom}
            onBack={() => setScreen('home')}
            isBusy={isBusy}
          />
        )}

        {screen === 'join' && (
          <JoinRoomScreen
            onJoinRoom={handleJoinRoom}
            onBack={() => setScreen('home')}
            isBusy={isBusy}
          />
        )}

        {screen === 'lobby' && room && player && (
          <LobbyScreen
            room={room}
            player={player}
            players={players}
            onStartGame={handleStartGame}
            onCopyCode={copyRoomCode}
            isBusy={isBusy}
          />
        )}

        {screen === 'story' && (
          <StoryScreen
            content={content}
            onContinue={() => setScreen('reading')}
          />
        )}

        {screen === 'reading' && (
          <ReadingScreen
            content={content}
            onContinue={handleReadingContinue}
          />
        )}

        {screen === 'question' && currentQuestion && (
          <QuestionScreen
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={content.questions.length}
            selectedOptionId={selectedOptionId}
            feedback={feedback}
            score={score}
            elapsedSeconds={elapsedSeconds}
            keyFragments={keyFragments}
            onSelectOption={setSelectedOptionId}
            onSubmitAnswer={handleSubmitAnswer}
            onNextLevel={handleNextLevel}
            onViewResult={() => setScreen('result')}
          />
        )}

        {screen === 'result' && (
          <ResultScreen
            content={content}
            finalCode={finalCode}
            score={score}
            elapsedSeconds={elapsedSeconds}
            levelStatus={levelStatus}
            onPlayAgain={resetToHome}
          />
        )}
      </main>
    </div>
  )
}

export default App
