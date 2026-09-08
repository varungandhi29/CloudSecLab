import React from 'react'
import { Zap } from 'lucide-react'

interface XPBarProps {
  totalXp: number
  level: number
  className?: string
}

export const XPBar: React.FC<XPBarProps> = ({ totalXp, level, className = '' }) => {
  const currentLevelXp = (level - 1) * 200
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelXp)
  const percentage = Math.min(100, (xpInCurrentLevel / 200) * 100)

  return (
    <div className={`bg-bg-panel border border-border-base rounded-lg p-4 text-xs ${className}`}>
      <div className="flex justify-between items-center mb-2 font-mono">
        <div className="flex items-center gap-1.5 font-semibold text-text-primary">
          <Zap className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />
          <span>Level {level} Progress</span>
        </div>
        <span className="text-text-muted">
          <strong className="text-text-primary">{totalXp.toLocaleString()}</strong> XP Total
        </span>
      </div>

      <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden border border-border-subtle">
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-full bg-accent-amber transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono text-text-muted mt-1.5">
        <span>{xpInCurrentLevel} / 200 XP to next tier</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export default XPBar
