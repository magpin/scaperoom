import { Icon } from '../components/ui/Icon'
import { formatElapsed } from '../utils/timing'
import type { EscapeRoomContent } from '../types/game'

interface ResultScreenProps {
  content: EscapeRoomContent
  finalCode: string
  score: number
  elapsedSeconds: number
  levelStatus: Record<number, 'pending' | 'correct' | 'incorrect'>
  onPlayAgain: () => void
}

export function ResultScreen({
  content,
  finalCode,
  score,
  elapsedSeconds,
  levelStatus,
  onPlayAgain,
}: ResultScreenProps) {
  const completedLevels = Object.values(levelStatus).filter((s) => s === 'correct').length
  const allCompleted = completedLevels === content.questions.length
  
  return (
    <div className="result-screen slide-up">
      {/* Header */}
      <div className="result-header">
        <div className="result-header__icon">
          <Icon name={allCompleted ? 'trophy' : 'target'} size={48} />
        </div>
        <h1 className="result-header__title">
          {allCompleted ? 'Mision Completada' : 'Resultado de Mision'}
        </h1>
        <p className="result-header__subtitle">
          {allCompleted
            ? 'Has restaurado el acceso al Archivo Central'
            : 'Has completado los retos disponibles'}
        </p>
      </div>
      
      {/* Final Code Card */}
      <div className="result-code-card game-card game-card--elevated">
        <div className="result-code-header">
          <Icon name="key" size={24} />
          <h2>Codigo Maestro</h2>
        </div>
        <div className="result-code-display">
          {finalCode ? (
            <span className="result-code-value">{finalCode}</span>
          ) : (
            <span className="result-code-empty">Sin completar</span>
          )}
        </div>
        {allCompleted && (
          <p className="result-code-message">
            Acceso restaurado exitosamente. El Archivo Central esta nuevamente disponible.
          </p>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="result-stats">
        <div className="result-stat-card">
          <div className="result-stat-icon result-stat-icon--gold">
            <Icon name="star" size={24} />
          </div>
          <div className="result-stat-content">
            <span className="result-stat-label">Puntaje Final</span>
            <span className="result-stat-value">{score}</span>
          </div>
        </div>
        
        <div className="result-stat-card">
          <div className="result-stat-icon result-stat-icon--green">
            <Icon name="clock" size={24} />
          </div>
          <div className="result-stat-content">
            <span className="result-stat-label">Tiempo Total</span>
            <span className="result-stat-value">{formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>
        
        <div className="result-stat-card">
          <div className="result-stat-icon result-stat-icon--blue">
            <Icon name="target" size={24} />
          </div>
          <div className="result-stat-content">
            <span className="result-stat-label">Niveles Superados</span>
            <span className="result-stat-value">{completedLevels}/{content.questions.length}</span>
          </div>
        </div>
        
        <div className="result-stat-card">
          <div className="result-stat-icon result-stat-icon--purple">
            <Icon name="key" size={24} />
          </div>
          <div className="result-stat-content">
            <span className="result-stat-label">Fragmentos</span>
            <span className="result-stat-value">{completedLevels}/{content.questions.length}</span>
          </div>
        </div>
      </div>
      
      {/* Level Summary */}
      <div className="result-levels game-card">
        <h3 className="result-levels__title">
          <Icon name="shield" size={20} />
          Resumen de Niveles
        </h3>
        <div className="result-levels__grid">
          {content.questions.map((question) => {
            const status = levelStatus[question.id]
            const isCompleted = status === 'correct'
            
            return (
              <div 
                key={question.id} 
                className={`result-level-item ${isCompleted ? 'result-level-item--completed' : ''}`}
              >
                <div className="result-level-status">
                  {isCompleted ? (
                    <Icon name="check" size={18} />
                  ) : (
                    <Icon name="x" size={18} />
                  )}
                </div>
                <div className="result-level-info">
                  <span className="result-level-name">{question.levelLabel}</span>
                  <span className="result-level-type">{question.levelType}</span>
                </div>
                {isCompleted && (
                  <div className="result-level-fragment">
                    <Icon name="key" size={12} />
                    {question.keyFragment}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Action */}
      <div className="result-action">
        <button className="btn btn--primary btn--lg" onClick={onPlayAgain} type="button">
          <Icon name="play" size={20} />
          Nueva Mision
        </button>
      </div>
    </div>
  )
}
