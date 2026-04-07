interface FragmentsPanelProps {
  fragments: string[]
  totalFragments: number
}

export function FragmentsPanel({ fragments, totalFragments }: FragmentsPanelProps) {
  const slots = Array.from({ length: totalFragments }, (_, i) => fragments[i] || null)
  
  return (
    <div className="fragments-panel">
      <span className="fragments-panel__title">Codigo Maestro</span>
      <div className="fragments-panel__items">
        {slots.map((fragment, index) => (
          <span 
            key={index} 
            className={`fragment-chip ${!fragment ? 'fragment-chip--empty' : ''}`}
          >
            {fragment || '?'}
          </span>
        ))}
      </div>
    </div>
  )
}
