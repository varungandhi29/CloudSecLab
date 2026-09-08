import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, Play, Clock, Zap } from 'lucide-react'
import { LevelSummary } from '../../types'
import { Badge } from './Badge'
import { CategoryIcon } from './CategoryIcon'

interface LevelCardProps {
  level: LevelSummary
}

export const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const isLocked = level.status === 'locked'
  const isCompleted = level.status === 'completed'
  const isUnlocked = level.status === 'unlocked'

  // Provider swatch dot
  const platform = (level.cloud_platform || 'aws').toLowerCase()
  const renderProviderDot = () => {
    if (platform === 'azure') {
      return <span className="w-2 h-2 rounded-full bg-[#4E9BE0] shrink-0" title="Microsoft Azure" />
    }
    if (platform === 'gcp') {
      return (
        <span className="flex items-center gap-0.5 shrink-0" title="Google Cloud Platform">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
        </span>
      )
    }
    return <span className="w-2 h-2 rounded-full bg-[#F5A623] shrink-0" title="Amazon Web Services" />
  }

  // Difficulty text mapping for accessibility
  const trackLabel =
    level.track === 'beginner'
      ? 'Beginner'
      : level.track === 'intermediate'
      ? 'Intermediate'
      : level.track === 'advanced'
      ? 'Advanced'
      : 'Expert'

  // Card border and background style
  let cardStyle = 'bg-bg-panel border-border-base hover:border-border-base/80 text-text-muted'
  if (isCompleted) {
    cardStyle = 'bg-bg-panel border-accent-teal/30 hover:border-accent-teal/50'
  } else if (isUnlocked) {
    cardStyle = 'bg-bg-panel border-accent-amber/40 hover:border-accent-amber/70'
  }

  const content = (
    <div
      className={`p-3.5 rounded-lg border transition-all duration-150 relative flex flex-col justify-between h-full ${cardStyle}`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {renderProviderDot()}
            <span className="font-mono text-[11px] font-semibold text-text-muted">
              L{level.level_id.toString().padStart(3, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-text-muted bg-bg-base border border-border-subtle px-1.5 py-0.5 rounded">
              {trackLabel}
            </span>
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0" aria-label="Completed" />
            ) : isLocked ? (
              <Lock className="w-3.5 h-3.5 text-text-muted/60 shrink-0" aria-label="Locked" />
            ) : (
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-accent-amber border-t-transparent animate-spin shrink-0"
                style={{ animationDuration: '3s' }}
                title="In Progress"
              />
            )}
          </div>
        </div>

        {/* Level Title */}
        <h4 className="font-medium text-xs text-text-primary leading-snug line-clamp-2 mb-2 group-hover:text-accent-teal transition-colors">
          {level.title}
        </h4>
      </div>

      {/* Footer Info Row */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-text-muted">
        <div className="flex items-center gap-1">
          <CategoryIcon category={level.category || level.title} className="w-3 h-3 text-text-muted" />
          <span className="truncate max-w-[90px] capitalize">
            {level.category || 'IAM'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-text-muted">
            <Clock className="w-3 h-3" />
            <span>{level.estimated_minutes || 20}m</span>
          </span>
          <span className="text-accent-amber font-semibold">
            +{level.xp_reward} XP
          </span>
        </div>
      </div>
    </div>
  )

  if (isLocked) {
    return (
      <div className="opacity-50 cursor-not-allowed select-none h-full" title={`Prerequisites required to unlock Level ${level.level_id}`}>
        {content}
      </div>
    )
  }

  return (
    <Link
      to={`/levels/${level.level_id}`}
      className="block h-full group focus-visible:ring-2 focus-visible:ring-accent-amber rounded-lg"
      aria-label={`Level ${level.level_id}: ${level.title}, ${trackLabel} level, ${level.estimated_minutes} minutes, ${level.xp_reward} XP reward`}
    >
      {content}
    </Link>
  )
}

export default LevelCard
