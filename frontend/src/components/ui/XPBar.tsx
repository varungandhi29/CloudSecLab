import React from 'react'
import { Zap } from 'lucide-react'

interface XPBarProps {
  totalXp: number
  level: number
}

export const XPBar: React.FC<XPBarProps> = ({ totalXp, level }) => {
  const currentLevelXp = (level - 1) * 200
  const nextLevelXp = level * 200
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelXp)
  const percentage = Math.min(100, (xpInCurrentLevel / 200) * 100)

  return (
    <div className="bg-card border border-gray-700/60 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          <span className="font-bold text-gray-100">Level {level}</span>
        </div>
        <span className="font-mono text-sm text-cyan-400 font-semibold">{totalXp.toLocaleString()} XP</span>
      </div>
      <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
