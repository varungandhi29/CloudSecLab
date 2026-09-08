import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Lock, Lightbulb } from 'lucide-react'

interface HintBoxProps {
  hints: string[]
  hintsUsed: number
  onUnlockHint: (index: number) => void
  disabled?: boolean
}

export const HintBox: React.FC<HintBoxProps> = ({
  hints,
  hintsUsed,
  onUnlockHint,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(
    hintsUsed > 0 ? hintsUsed - 1 : null
  )

  if (!hints || hints.length === 0) return null

  return (
    <div className="bg-bg-panel-subtle border border-border-base rounded-lg overflow-hidden my-3">
      {/* Main Disclosure Trigger */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-mono font-medium text-text-muted hover:text-text-primary hover:bg-bg-panel transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-accent-amber" />
          <span>Need a hint?</span>
          <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-bg-base border border-border-base">
            {hintsUsed} of {hints.length} unlocked
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Content with Progressive Disclosure */}
      {isExpanded && (
        <div className="p-3 border-t border-border-base bg-bg-base space-y-2 text-xs">
          <p className="text-[11px] text-text-muted font-sans leading-normal">
            Hints reveal guidance progressively. Unlocking a hint applies a small XP penalty (25 XP).
          </p>

          <div className="space-y-1.5 pt-1">
            {hints.map((hintText, idx) => {
              const isUnlocked = idx < hintsUsed
              const isNextToUnlock = idx === hintsUsed

              return (
                <div
                  key={idx}
                  className={`border rounded-md p-2.5 transition-all ${
                    isUnlocked
                      ? 'bg-bg-panel border-border-base'
                      : isNextToUnlock
                      ? 'bg-bg-panel-subtle border-border-subtle'
                      : 'bg-bg-base border-border-subtle opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                    <div className="flex items-center gap-1.5">
                      {isUnlocked ? (
                        <Lightbulb className="w-3.5 h-3.5 text-accent-amber" />
                      ) : (
                        <Lock className="w-3 h-3 text-text-muted" />
                      )}
                      <span className={isUnlocked ? 'text-text-primary font-semibold' : 'text-text-muted'}>
                        Hint {idx + 1} of {hints.length}
                      </span>
                    </div>

                    {!isUnlocked && isNextToUnlock && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          onUnlockHint(idx)
                          setActiveHintIndex(idx)
                        }}
                        className="px-2 py-0.5 rounded bg-accent-amber/15 hover:bg-accent-amber/25 text-accent-amber border border-accent-amber/30 text-[10px] font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
                      >
                        Unlock (-25 XP)
                      </button>
                    )}
                  </div>

                  {isUnlocked ? (
                    <div className="text-text-primary font-mono text-xs pl-5 py-0.5 leading-relaxed bg-bg-input/60 rounded p-1.5 border border-border-subtle mt-1">
                      {hintText}
                    </div>
                  ) : (
                    <div className="text-text-muted text-[11px] pl-5 italic">
                      {isNextToUnlock
                        ? 'Click unlock to reveal this hint.'
                        : 'Unlock preceding hints first.'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default HintBox
