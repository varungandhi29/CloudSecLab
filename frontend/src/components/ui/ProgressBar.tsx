import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'teal' | 'amber' | 'cyan' | 'gold' | 'green'
  showLabel?: boolean
  label?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'teal',
  showLabel = false,
  label = 'Progress',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const colorMap: Record<string, string> = {
    teal: 'bg-accent-teal',
    green: 'bg-accent-teal',
    cyan: 'bg-accent-teal',
    amber: 'bg-accent-amber',
    gold: 'bg-accent-amber',
  }

  const barColor = colorMap[color] || 'bg-accent-teal'

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-mono text-text-muted mb-1">
          <span>{label}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-bg-panel rounded-full overflow-hidden border border-border-subtle">
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
