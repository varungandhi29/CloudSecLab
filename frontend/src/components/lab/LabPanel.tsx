import React, { useState } from 'react'
import { api } from '../../services/api'
import { LevelDetail } from '../../types'
import { CodeBlock } from '../ui/CodeBlock'
import { HintBox } from '../ui/HintBox'
import { notify } from '../../store/toastStore'
import { Play, RotateCw, CheckCircle2, AlertCircle, Terminal as TerminalIcon, Sparkles } from 'lucide-react'

interface LabPanelProps {
  level: LevelDetail
  levelId: number
  onComplete: () => void
  onStepProgressChange?: (completedCount: number, totalCount: number) => void
}

export const LabPanel: React.FC<LabPanelProps> = ({
  level,
  levelId,
  onComplete,
  onStepProgressChange,
}) => {
  const [labStatus, setLabStatus] = useState<'idle' | 'provisioning' | 'connected' | 'failed'>(
    level.user_progress?.lab_completed ? 'connected' : 'idle'
  )
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState('')
  const [hintsUsed, setHintsUsed] = useState(level.user_progress?.hints_used || 0)
  const [validation, setValidation] = useState<{ passed?: boolean; feedback?: string } | null>(
    level.user_progress?.lab_completed ? { passed: true, feedback: 'Lab completed successfully!' } : null
  )
  const [validating, setValidating] = useState(false)

  const steps = level.lab?.steps || []
  const allStepsComplete = steps.length === 0 || steps.every((_, i) => completedSteps.has(i))

  const startLab = async () => {
    setLabStatus('provisioning')
    try {
      await api.post(`/labs/${levelId}/start`)
      setLabStatus('connected')
      notify.success('Sandbox Provisioned', 'LocalStack AWS emulation environment ready.')
    } catch {
      setLabStatus('failed')
      notify.error('Sandbox Provisioning Failed', 'Verify LocalStack is running or click retry.')
    }
  }

  const resetLab = async () => {
    setLabStatus('provisioning')
    try {
      await api.post(`/labs/${levelId}/reset`)
      setLabStatus('connected')
      notify.info('Sandbox Reset', 'Lab environment resources restored to initial state.')
    } catch {
      setLabStatus('failed')
    }
  }

  const handleUnlockHint = async (index: number) => {
    try {
      const res = await api.get(`/levels/${levelId}/hints?hint_index=${index}`)
      setHintsUsed(res.data.hints_used)
      notify.info(`Hint ${index + 1} Unlocked`, '-25 XP deducted')
    } catch {
      // Fallback local unlock
      setHintsUsed(Math.max(hintsUsed, index + 1))
    }
  }

  const handleValidate = async () => {
    if (!answer.trim()) return
    setValidating(true)
    try {
      const res = await api.post(`/labs/${levelId}/validate`, { user_answer: answer })
      setValidation(res.data)
      if (res.data.passed) {
        notify.success('Validation Passed (+100 XP)', 'Objective completed!')
        onComplete()
      } else {
        notify.error('Validation Failed', res.data.feedback || 'Answer did not match expected result.')
      }
    } catch (err: any) {
      const feedback = err.response?.data?.detail || 'Validation request failed.'
      setValidation({ passed: false, feedback })
      notify.error('Validation Error', feedback)
    } finally {
      setValidating(false)
    }
  }

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
        notify.success(`Step ${idx + 1} checked`)
      }
      return next
    })
  }

  return (
    <div className="space-y-4 text-text-primary text-xs">
      {/* Persistent Lab Status Chip & Controls */}
      <div className="bg-bg-panel border border-border-base rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {labStatus === 'connected' && (
              <>
                <span className="w-2 h-2 rounded-full bg-accent-teal" />
                <span className="text-accent-teal font-semibold">Connected</span>
              </>
            )}
            {labStatus === 'provisioning' && (
              <>
                <span className="w-2 h-2 rounded-full bg-accent-amber animate-ping" />
                <span className="text-accent-amber font-semibold">Provisioning...</span>
              </>
            )}
            {labStatus === 'idle' && (
              <>
                <span className="w-2 h-2 rounded-full bg-text-muted/60" />
                <span className="text-text-muted">Idle</span>
              </>
            )}
            {labStatus === 'failed' && (
              <>
                <span className="w-2 h-2 rounded-full bg-accent-danger" />
                <span className="text-accent-danger font-semibold">Failed</span>
              </>
            )}
          </div>
          <span className="text-text-muted font-mono text-[11px] hidden sm:inline">• LocalStack :4566</span>
        </div>

        <div className="flex items-center gap-2">
          {labStatus === 'idle' && (
            <button
              type="button"
              onClick={startLab}
              className="px-3 py-1 bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal border border-accent-teal/40 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-accent-amber"
            >
              <Play className="w-3 h-3 fill-accent-teal" />
              <span>Start Sandbox</span>
            </button>
          )}

          {labStatus === 'connected' && (
            <button
              type="button"
              onClick={resetLab}
              className="px-2.5 py-1 bg-bg-base hover:bg-bg-panel-subtle text-text-muted hover:text-text-primary border border-border-base rounded text-[11px] font-mono transition-colors flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-accent-amber"
              title="Reset Sandbox Resources"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {labStatus === 'failed' && (
            <button
              type="button"
              onClick={startLab}
              className="px-3 py-1 bg-accent-danger/20 hover:bg-accent-danger/30 text-accent-danger border border-accent-danger/40 rounded text-xs font-mono font-semibold transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Scenario Briefing */}
      <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-accent-amber font-mono font-semibold text-xs uppercase tracking-wider">
          <span>🎯</span>
          <span>Mission Briefing</span>
        </div>
        {level.lab?.scenario && (
          <p className="text-[#C8D1DC] text-xs leading-relaxed m-0 font-sans">{level.lab.scenario}</p>
        )}
        <div className="bg-bg-input border border-border-base rounded p-2.5 text-xs font-mono mt-2">
          <span className="text-accent-teal font-semibold mr-1.5">OBJECTIVE:</span>
          <span className="text-text-primary">{level.lab?.objective}</span>
        </div>
      </div>

      {/* Lab Steps / Interactive Commands */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-text-muted uppercase tracking-wider font-semibold">
            Lab Procedure ({completedSteps.size}/{steps.length} Steps)
          </span>
          <span className="text-[11px] text-text-muted">Execute in your terminal or emulator</span>
        </div>

        {steps.map((step, idx) => {
          const isDone = completedSteps.has(idx)

          return (
            <div
              key={idx}
              className={`bg-bg-panel border rounded-lg overflow-hidden transition-all ${
                isDone ? 'border-accent-teal/40' : 'border-border-base'
              }`}
            >
              {/* Step Header */}
              <div className="px-3.5 py-2 bg-bg-panel-subtle border-b border-border-base flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone
                        ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/40'
                        : 'bg-bg-base text-text-muted border border-border-base'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </span>
                  <span className="font-medium text-text-primary">{step.instruction}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStep(idx)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    isDone
                      ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/30'
                      : 'bg-bg-base text-text-muted hover:text-text-primary border-border-base'
                  }`}
                >
                  {isDone ? 'Checked ✓' : 'Mark Done'}
                </button>
              </div>

              {/* Command and Explanation */}
              <div className="p-3.5 space-y-2">
                <CodeBlock code={step.command} showPrompt={true} language="bash" />

                {step.expected_output_contains && (
                  <div className="bg-bg-input border border-border-subtle rounded p-2 text-[11px] font-mono text-text-muted">
                    <span className="text-[10px] text-text-muted uppercase block mb-0.5">Expected Output Pattern:</span>
                    <pre className="text-text-primary whitespace-pre-wrap leading-tight">{step.expected_output_contains}</pre>
                  </div>
                )}

                {step.explanation && (
                  <p className="text-text-muted text-[11px] leading-relaxed m-0 font-sans italic">
                    {step.explanation}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Answer Validation Form */}
      <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 font-mono font-semibold text-xs text-text-primary">
          <TerminalIcon className="w-4 h-4 text-accent-amber" />
          <span>Submit Objective Result</span>
        </div>

        <p className="text-xs text-text-muted leading-normal font-sans">
          {level.lab?.validation?.question || 'Enter the answer or discovered credential to complete this lab:'}
        </p>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            placeholder="e.g. svc-deploy, public-bucket-name..."
            className="flex-1 bg-bg-input border border-border-base rounded px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted/60 focus-visible:ring-1 focus-visible:ring-accent-amber"
          />
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating || !answer.trim()}
            className="px-4 py-2 bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/40 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-accent-amber"
          >
            {validating ? 'Validating...' : 'Validate'}
          </button>
        </div>

        {validation && (
          <div
            className={`p-3 rounded border text-xs font-mono flex items-start gap-2 ${
              validation.passed
                ? 'bg-accent-teal/10 border-accent-teal/40 text-accent-teal'
                : 'bg-accent-danger/10 border-accent-danger/40 text-accent-danger'
            }`}
          >
            {validation.passed ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-semibold block">
                {validation.passed ? 'Objective Completed!' : 'Incorrect Output'}
              </span>
              <span className="text-[11px] opacity-90 leading-relaxed font-sans">
                {validation.feedback}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progressive Hints */}
      {level.lab?.hints && level.lab.hints.length > 0 && (
        <HintBox
          hints={level.lab.hints}
          hintsUsed={hintsUsed}
          onUnlockHint={handleUnlockHint}
        />
      )}
    </div>
  )
}

export default LabPanel
