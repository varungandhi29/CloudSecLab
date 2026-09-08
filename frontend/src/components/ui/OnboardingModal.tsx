import React, { useState, useEffect } from 'react'
import { BookOpen, Terminal, Lightbulb, Award, ChevronRight, X, Check } from 'lucide-react'

const ONBOARDING_STORAGE_KEY = 'cloudseclab_onboarding_completed'

export const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!hasSeen) {
      setIsOpen(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  const steps = [
    {
      title: 'Task Write-up & Architecture Diagrams',
      icon: <BookOpen className="w-5 h-5 text-accent-teal" />,
      description:
        'The left pane contains your mission write-up, concept diagrams (IAM trust policies, S3 bucket flows, VPC layouts), and checkpoint tasks to verify understanding as you learn.',
    },
    {
      title: 'Interactive Sandbox Console',
      icon: <Terminal className="w-5 h-5 text-accent-amber" />,
      description:
        'The right pane connects to our live LocalStack emulation sandbox. Copy AWS CLI commands with one click, run tests, and submit your discovered credentials or outputs for instant validation.',
    },
    {
      title: 'Progressive Hint System',
      icon: <Lightbulb className="w-5 h-5 text-accent-amber" />,
      description:
        'Stuck on an objective? Reveal hints progressively behind the disclosure button. Hint 1 gives you architectural direction; Hint 2 provides tactical syntax guidance.',
    },
    {
      title: 'Module Certification & Progress',
      icon: <Award className="w-5 h-5 text-accent-teal" />,
      description:
        'Complete 25 levels in any track to unlock its timed module exam. Passing awards an official, cryptographically verifiable PDF certificate shareable with employers.',
    },
  ]

  if (!isOpen) return null

  const step = steps[currentStep]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="bg-bg-panel border border-border-base rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 text-xs text-text-primary relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Step indicator */}
        <div className="flex items-center justify-between border-b border-border-base pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-bg-base border border-border-base flex items-center justify-center">
              {step.icon}
            </div>
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
              Quick Orientation ({currentStep + 1} of {steps.length})
            </span>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="text-text-muted hover:text-text-primary p-1 rounded focus-visible:ring-1 focus-visible:ring-accent-amber"
            aria-label="Skip walkthrough"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2 py-1">
          <h3 id="onboarding-title" className="text-base font-bold text-text-primary font-mono leading-snug">
            {step.title}
          </h3>
          <p className="text-text-muted text-xs leading-relaxed font-sans m-0">
            {step.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between pt-3 border-t border-border-base">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-accent-teal'
                    : 'w-1.5 bg-border-base'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleComplete}
              className="px-3 py-1.5 text-text-muted hover:text-text-primary font-mono text-xs transition-colors"
            >
              Skip
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-1.5 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-mono font-semibold rounded text-xs transition-colors flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-accent-amber"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="px-4 py-1.5 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-mono font-bold rounded text-xs transition-colors flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-accent-amber"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
