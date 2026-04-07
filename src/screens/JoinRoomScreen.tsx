import { useState } from 'react'
import { Icon } from '../components/ui/Icon'

interface JoinRoomScreenProps {
  onJoinRoom: (code: string, playerName: string) => Promise<void>
  onBack: () => void
  isBusy: boolean
}

export function JoinRoomScreen({ onJoinRoom, onBack, isBusy }: JoinRoomScreenProps) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim() && roomCode.trim()) {
      void onJoinRoom(roomCode.trim(), playerName.trim())
    }
  }
  
  return (
    <div className="room-screen slide-up">
      <button className="back-button" onClick={onBack} type="button">
        <Icon name="arrow-right" size={16} />
        <span>Volver al inicio</span>
      </button>
      
      <div className="room-card game-card game-card--elevated">
        <div className="room-card__header">
          <div className="room-card__icon room-card__icon--secondary">
            <Icon name="users" size={28} />
          </div>
          <div>
            <h2 className="room-card__title">Unirse a Sala</h2>
            <p className="room-card__subtitle">Ingresa con el codigo que te compartio el anfitrion</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="room-form">
          <div className="input-group">
            <label className="input-label" htmlFor="playerName">
              Tu Nombre
            </label>
            <input
              id="playerName"
              type="text"
              className="input input--lg"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ejemplo: Camila"
              autoFocus
              disabled={isBusy}
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="roomCode">
              Codigo de Sala
            </label>
            <input
              id="roomCode"
              type="text"
              className="input input--lg input--code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              disabled={isBusy}
            />
            <p className="input-hint">El codigo tiene 6 caracteres y es proporcionado por el anfitrion</p>
          </div>
          
          <div className="room-form__actions">
            <button 
              type="submit" 
              className="btn btn--primary btn--lg btn--full"
              disabled={!playerName.trim() || !roomCode.trim() || isBusy}
            >
              {isBusy ? (
                <>
                  <span className="spinner" />
                  Ingresando...
                </>
              ) : (
                <>
                  <Icon name="arrow-right" size={20} />
                  Unirse a la Mision
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="room-info">
          <div className="room-info__item">
            <Icon name="shield" size={18} />
            <span>Tu progreso se guardara automaticamente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
