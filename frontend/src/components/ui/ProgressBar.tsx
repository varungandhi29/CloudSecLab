import React from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'cyan' | 'gold' | 'green'
  showLabel?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color = 'cyan', showLabel = false }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const colorMap = {
    cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    gold: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    green: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className={`h-full transition-all duration-500 rounded-full ${colorMap[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
