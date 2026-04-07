import { Icon } from '../components/ui/Icon'
import type { RoomPlayer, RoomSession } from '../types/game'

interface LobbyScreenProps {
  room: RoomSession
  player: RoomPlayer
  players: RoomPlayer[]
  onStartGame: () => Promise<void>
  onCopyCode: () => void
  isBusy: boolean
}

export function LobbyScreen({ 
  room, 
  player, 
  players, 
  onStartGame, 
  onCopyCode,
  isBusy 
}: LobbyScreenProps) {
  return (
    <div className="lobby-screen slide-up">
      <div className="lobby-header">
        <div className="lobby-header__content">
          <span className="badge badge--success">
            <span className="badge__dot" />
            Sala Activa
          </span>
          <h1 className="lobby-header__title">Lobby de Mision</h1>
          <p className="lobby-header__subtitle">
            Esperando a que todos los agentes se conecten antes de iniciar
          </p>
        </div>
      </div>
      
      <div className="lobby-grid">
        {/* Room Code Card */}
        <div className="lobby-card game-card">
          <h3 className="lobby-card__title">
            <Icon name="key" size={20} />
            Codigo de Sala
          </h3>
          
          <div className="room-code">
            <span className="room-code__label">Comparte este codigo</span>
            <span className="room-code__value">{room.roomCode}</span>
          </div>
          
          <button 
            className="btn btn--secondary btn--full mt-md" 
            onClick={onCopyCode}
            type="button"
          >
            <Icon name="copy" size={18} />
            Copiar Codigo
          </button>
        </div>
        
        {/* Players Card */}
        <div className="lobby-card game-card">
          <h3 className="lobby-card__title">
            <Icon name="users" size={20} />
            Agentes Conectados ({players.length})
          </h3>
          
          <div className="players-list">
            {players.map((member) => (
              <div 
                key={member.playerId} 
                className={`player-card ${member.isHost ? 'player-card--host' : ''}`}
              >
                <div className="player-card__avatar">
                  {member.playerName.charAt(0).toUpperCase()}
                </div>
                <div className="player-card__info">
                  <p className="player-card__name">
                    {member.playerName}
                    {member.playerId === player.playerId && ' (Tu)'}
                  </p>
                  <span className="player-card__role">
                    {member.isHost ? 'Anfitrion' : 'Jugador'}
                  </span>
                </div>
                {member.isHost && (
                  <div className="player-card__badge">
                    <Icon name="star" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Action Area */}
      <div className="lobby-actions">
        {player.isHost ? (
          <div className="lobby-actions__host">
            <p className="lobby-actions__hint">
              Como anfitrion, puedes iniciar la partida cuando todos esten listos
            </p>
            <button 
              className="btn btn--success btn--lg"
              onClick={onStartGame}
              disabled={isBusy}
              type="button"
            >
              {isBusy ? (
                <>
                  <span className="spinner" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Icon name="play" size={20} />
                  Iniciar Mision
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="lobby-actions__waiting">
            <div className="waiting-indicator">
              <span className="waiting-indicator__dot" />
              <span className="waiting-indicator__dot" />
              <span className="waiting-indicator__dot" />
            </div>
            <p>Esperando a que el anfitrion inicie la mision...</p>
          </div>
        )}
      </div>
    </div>
  )
}
