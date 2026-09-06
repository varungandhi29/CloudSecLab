import React from 'react'
import { Lock, CheckCircle2, Play, Zap } from 'lucide-react'
import { LevelSummary } from '../../types'
import { Badge } from './Badge'
import { Link } from 'react-router-dom'

interface LevelCardProps {
  level: LevelSummary
}

export const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const isLocked = level.status === 'locked'
  const isCompleted = level.status === 'completed'
  const isUnlocked = level.status === 'unlocked'

  let borderStyle = 'border-gray-800 bg-card/60 hover:border-gray-700'
  if (isCompleted) {
    borderStyle = 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50'
  } else if (isUnlocked) {
    borderStyle = 'border-cyan-500/40 bg-cyan-950/10 hover:border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse-slow'
  }

  const content = (
    <div className={`p-4 rounded-xl border transition-all duration-300 relative group flex flex-col justify-between h-full ${borderStyle}`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-gray-400 font-semibold">
            LEVEL {level.level_id.toString().padStart(3, '0')}
          </span>
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-gray-500" />
          ) : (
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          )}
        </div>

        <h4 className="font-bold text-gray-100 text-sm mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {level.title}
        </h4>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between">
        <Badge variant={isCompleted ? 'green' : isLocked ? 'gray' : 'cyan'}>
          {(level.cloud_platform || 'aws').toUpperCase()}
        </Badge>

        <div className="flex items-center space-x-1 text-xs font-mono text-amber-400 font-semibold">
          <Zap className="w-3.5 h-3.5 fill-amber-400/30" />
          <span>+{level.xp_reward} XP</span>
        </div>
      </div>
    </div>
  )

  if (isLocked) {
    return <div className="opacity-60 cursor-not-allowed h-full">{content}</div>
  }

  return (
    <Link to={`/levels/${level.level_id}`} className="block h-full">
      {content}
    </Link>
  )
}
