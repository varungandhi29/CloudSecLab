import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface HintBoxProps {
  hints: string[]
  hintsUsed: number
  onUnlockHint: (index: number) => void
}

export const HintBox: React.FC<HintBoxProps> = ({ hints, hintsUsed, onUnlockHint }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
        <HelpCircle className="w-4 h-4" />
        <span>Hints ({hintsUsed}/{hints.length} unlocked)</span>
      </div>

      <div className="space-y-2">
        {hints.map((hint, idx) => {
          const isUnlocked = idx < hintsUsed
          const isOpen = openIndex === idx

          return (
            <div key={idx} className="border border-gray-800 rounded-lg overflow-hidden bg-card/60">
              <button
                onClick={() => {
                  if (!isUnlocked) {
                    onUnlockHint(idx)
                  }
                  setOpenIndex(isOpen ? null : idx)
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium flex justify-between items-center text-gray-300 hover:text-white hover:bg-gray-800/40 transition-colors"
              >
                <span>
                  Hint {idx + 1} {isUnlocked ? '(Unlocked)' : '(Costs 25 XP)'}
                </span>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isOpen && (
                <div className="px-4 py-3 bg-gray-950/80 text-sm font-mono text-cyan-300 border-t border-gray-800">
                  {isUnlocked ? hint : 'Click to unlock this hint for 25 XP penalty.'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
