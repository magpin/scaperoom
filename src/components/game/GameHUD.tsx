import { Icon } from '../ui/Icon'
import { formatElapsed } from '../../utils/timing'

interface GameHUDProps {
  currentLevel: number
  totalLevels: number
  score: number
  elapsedSeconds: number
  keyFragments: string[]
}

export function GameHUD({ 
  currentLevel, 
  totalLevels, 
  score, 
  elapsedSeconds, 
  keyFragments 
}: GameHUDProps) {
  return (
    <div className="hud fade-in">
      <div className="hud__item">
        <div className="hud__icon">
          <Icon name="target" size={16} />
        </div>
        <div>
          <p className="hud__label">Nivel</p>
          <p className="hud__value">{currentLevel}/{totalLevels}</p>
        </div>
      </div>
      
      <div className="hud__divider" />
      
      <div className="hud__item">
        <div className="hud__icon" style={{ background: 'var(--color-gold-soft)', color: 'var(--color-gold)' }}>
          <Icon name="star" size={16} />
        </div>
        <div>
          <p className="hud__label">Puntaje</p>
          <p className="hud__value">{score}</p>
        </div>
      </div>
      
      <div className="hud__divider" />
      
      <div className="hud__item">
        <div className="hud__icon" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
          <Icon name="clock" size={16} />
        </div>
        <div>
          <p className="hud__label">Tiempo</p>
          <p className="hud__value">{formatElapsed(elapsedSeconds)}</p>
        </div>
      </div>
      
      <div className="hud__divider" />
      
      <div className="hud__item">
        <div className="hud__icon" style={{ background: 'var(--color-fragment-soft)', color: 'var(--color-fragment)' }}>
          <Icon name="key" size={16} />
        </div>
        <div>
          <p className="hud__label">Fragmentos</p>
          <p className="hud__value">{keyFragments.length}/{totalLevels}</p>
        </div>
      </div>
    </div>
  )
}
