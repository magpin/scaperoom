import { Icon } from '../components/ui/Icon'
import type { EscapeRoomContent } from '../types/game'

interface HomeScreenProps {
  content: EscapeRoomContent
  persistenceMode: 'supabase' | 'local'
  onCreateRoom: () => void
  onJoinRoom: () => void
}

export function HomeScreen({ content, persistenceMode, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  return (
    <div className="home-screen slide-up">
      {/* Hero Section */}
      <section className="hero hero--vintage">
        <div className="hero__content">
          <h1 className="hero__title vintage-title">{content.title}</h1>
          
          <div className="hero__actions">
            <button className="btn btn--primary btn--lg vintage-button" onClick={onCreateRoom}>
              <Icon name="play" size={20} />
              Crear Sala
            </button>
            <button className="btn btn--secondary btn--lg vintage-button-secondary" onClick={onJoinRoom}>
              <Icon name="users" size={20} />
              Unirse a Sala
            </button>
          </div>
          
          <div className="hero__meta">
            <span className="badge vintage-badge">
              <span className="badge__dot" />
              Persistencia: {persistenceMode === 'supabase' ? 'Supabase' : 'Local'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
