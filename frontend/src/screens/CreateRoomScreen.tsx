import { useState } from 'react'
import { Icon } from '../components/ui/Icon'

interface CreateRoomScreenProps {
  onCreateRoom: (hostName: string) => Promise<void>
  onBack: () => void
  isBusy: boolean
}

export function CreateRoomScreen({ onCreateRoom, onBack, isBusy }: CreateRoomScreenProps) {
  const [hostName, setHostName] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hostName.trim()) {
      void onCreateRoom(hostName.trim())
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
          <div className="room-card__icon room-card__icon--primary">
            <Icon name="play" size={28} />
          </div>
          <div>
            <h2 className="room-card__title">Crear Nueva Sala</h2>
            <p className="room-card__subtitle">Inicia una mision y comparte el codigo con tu equipo</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="room-form">
          <div className="input-group">
            <label className="input-label" htmlFor="hostName">
              Nombre del Anfitrion
            </label>
            <input
              id="hostName"
              type="text"
              className="input input--lg"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Ejemplo: Prof. Laura"
              autoFocus
              disabled={isBusy}
            />
            <p className="input-hint">Este nombre sera visible para todos los jugadores</p>
          </div>
          
          <div className="room-form__actions">
            <button 
              type="submit" 
              className="btn btn--primary btn--lg btn--full"
              disabled={!hostName.trim() || isBusy}
            >
              {isBusy ? (
                <>
                  <span className="spinner" />
                  Creando sala...
                </>
              ) : (
                <>
                  <Icon name="play" size={20} />
                  Crear y Entrar al Lobby
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="room-info">
          <div className="room-info__item">
            <Icon name="users" size={18} />
            <span>Podras invitar jugadores con un codigo unico</span>
          </div>
          <div className="room-info__item">
            <Icon name="clock" size={18} />
            <span>Inicia la partida cuando todos esten listos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
