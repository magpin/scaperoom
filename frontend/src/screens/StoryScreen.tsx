import { Icon } from '../components/ui/Icon'
import type { EscapeRoomContent } from '../types/game'

interface StoryScreenProps {
  content: EscapeRoomContent
  onContinue: () => void
}

export function StoryScreen({ content, onContinue }: StoryScreenProps) {
  return (
    <div className="book-container story-screen slide-up paper-aged corner-decoration">
      <div className="book-page">
        <div className="story-header">
          <div className="wax-seal">
            <Icon name="shield" size={16} />
            <span>Briefing Confidencial</span>
          </div>
          <h1 className="story-header__title">{content.missionTitle}</h1>
        </div>
        
        <div className="ornamental-line">✦</div>
        
        <div className="story-card game-card game-card--mission paper-aged">
          <div className="story-card__header corner-decoration">
            <div className="story-card__icon">
              <Icon name="book" size={24} />
            </div>
            <div>
              <h2 className="story-card__title">Situacion Actual</h2>
              <p className="story-card__meta">Archivo de mision clasificado</p>
            </div>
          </div>
          
          <div className="ornamental-border"></div>
          
          <div className="story-content book-content">
            <p className="story-text">{content.story}</p>
          </div>
          
          <div className="ornamental-border"></div>
          
          <div className="story-objectives">
            <h3 className="story-objectives__title">
              <Icon name="target" size={18} />
              Objetivos de la Mision
            </h3>
            <ul className="story-objectives__list">
              <li>
                <span className="objective-number">01</span>
                <span>Leer y analizar el informe base del Archivo Central</span>
              </li>
              <li>
                <span className="objective-number">02</span>
                <span>Superar los 4 niveles de comprension lectora</span>
              </li>
              <li>
                <span className="objective-number">03</span>
                <span>Recuperar los fragmentos del codigo maestro</span>
              </li>
              <li>
                <span className="objective-number">04</span>
                <span>Restaurar el acceso al sistema</span>
              </li>
            </ul>
          </div>
          
          <div className="story-warning">
            <Icon name="zap" size={18} />
            <p>
              <strong>Importante:</strong> Cada respuesta correcta desbloquea un fragmento del codigo. 
              Los errores te haran retroceder temporalmente.
            </p>
          </div>
        </div>
        
        <div className="story-action">
          <button className="btn btn--primary btn--lg vintage-button" onClick={onContinue} type="button">
            <Icon name="book" size={20} />
            Acceder al Informe Base
            <Icon name="arrow-right" size={20} />
          </button>
        </div>

        <div className="book-page-number">— página —</div>
      </div>
    </div>
  )
}
