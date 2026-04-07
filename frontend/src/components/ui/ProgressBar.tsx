interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
}

export function ProgressBar({ current, total, showLabel = false }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100))
  
  return (
    <div className="progress-bar-wrapper">
      {showLabel && (
        <div className="progress-bar-label">
          <span>Progreso</span>
          <span>{current}/{total}</span>
        </div>
      )}
      <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div 
          className="progress-bar__fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
