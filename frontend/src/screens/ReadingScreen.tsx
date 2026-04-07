import { Icon } from '../components/ui/Icon'
import type { EscapeRoomContent } from '../types/game'

interface ReadingScreenProps {
  content: EscapeRoomContent
  onContinue: () => void
}

export function ReadingScreen({ content, onContinue }: ReadingScreenProps) {
  return (
    <div className="book-container reading-screen slide-up paper-aged corner-decoration">
      <div className="book-page">
        <div className="reading-header">
          <div className="wax-seal">
            <Icon name="book" size={16} />
            <span>Documento Recuperado</span>
          </div>
          <h1 className="reading-header__title">{content.readingTitle}</h1>
          <p className="reading-header__subtitle">
            Lee cuidadosamente el siguiente texto. Necesitaras esta informacion para superar los retos.
          </p>
        </div>
        
        <div className="ornamental-line">✦</div>
        
        <div className="reading-card game-card paper-aged">
          <div className="reading-card__meta corner-decoration">
            <span className="reading-meta-item">
              <Icon name="shield" size={14} />
              Archivo del Sistema
            </span>
            <span className="reading-meta-item">
              <Icon name="clock" size={14} />
              Lectura recomendada: 3-5 min
            </span>
          </div>
          
          <div className="reading-content book-content">
            <div className="reading-text">
              {content.readingText}
            </div>
          </div>
          
          <div className="ornamental-border"></div>
          
          <div className="reading-tips">
            <h4 className="reading-tips__title">
              <Icon name="zap" size={16} />
              Consejos para la Mision
            </h4>
            <div className="reading-tips__grid">
              <div className="reading-tip">
                <span className="reading-tip__label">Nivel 1 - Literal</span>
                <p>Busca datos explicitos en el texto</p>
              </div>
              <div className="reading-tip">
                <span className="reading-tip__label">Nivel 2 - Inferencial</span>
                <p>Deduce informacion implicita</p>
              </div>
              <div className="reading-tip">
                <span className="reading-tip__label">Nivel 3 - Critico</span>
                <p>Evalua y emite juicios</p>
              </div>
              <div className="reading-tip">
                <span className="reading-tip__label">Nivel 4 - Aplicado</span>
                <p>Transfiere a nuevos contextos</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="reading-action">
          <p className="reading-action__hint">
            Cuando estes listo, presiona el boton para comenzar los retos
          </p>
          <button className="btn btn--primary btn--lg vintage-button" onClick={onContinue} type="button">
            <Icon name="target" size={20} />
            Iniciar Nivel 1
            <Icon name="arrow-right" size={20} />
          </button>
        </div>

        <div className="book-page-number">— página —</div>
      </div>
    </div>
  )
}
