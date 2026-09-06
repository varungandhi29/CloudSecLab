import React, { useState } from 'react'
import { api } from '../../services/api'
import { LevelDetail } from '../../types'

interface LabPanelProps {
  level: LevelDetail
  levelId: number
  onComplete: () => void
}

function HintBox({ hint, index, xpCost }: { hint: string; index: number; xpCost: number }) {
  const [unlocked, setUnlocked] = useState(false)
  return (
    <div style={{ background: '#0A0E1A', border: '1px solid #374151', borderRadius: '6px', padding: '12px 16px' }}>
      {unlocked ? (
        <div style={{ color: '#D1D5DB', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
          💡 Hint {index + 1}: {hint}
        </div>
      ) : (
        <button
          onClick={() => setUnlocked(true)}
          style={{ background: 'none', border: 'none', color: '#06B6D4', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Unlock Hint {index + 1} (-{xpCost} XP)
        </button>
      )}
    </div>
  )
}

export default function LabPanel({ level, levelId, onComplete }: LabPanelProps) {
  const [labStatus, setLabStatus] = useState<'idle' | 'starting' | 'ready' | 'failed'>(
    level.user_progress?.lab_completed ? 'ready' : 'idle'
  )
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [answer, setAnswer] = useState('')
  const [validation, setValidation] = useState<{ passed?: boolean; feedback?: string; output?: string } | null>(
    level.user_progress?.lab_completed ? { passed: true, feedback: 'Lab completed!' } : null
  )
  const [copied, setCopied] = useState<number | null>(null)

  const steps = level.lab?.steps || []
  const allStepsComplete = steps.length === 0 || steps.every((_, i) => completedSteps.has(i))

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const startLab = async () => {
    setLabStatus('starting')
    try {
      await api.post(`/labs/${levelId}/start`)
      setLabStatus('ready')
    } catch {
      setLabStatus('failed')
    }
  }

  const handleValidate = async () => {
    try {
      const res = await api.post(`/labs/${levelId}/validate`, { user_answer: answer })
      setValidation(res.data)
      if (res.data.passed) {
        onComplete?.()
      }
    } catch (err: any) {
      const feedback = err.response?.data?.detail || 'Validation failed. Check your answer.'
      setValidation({ passed: false, feedback })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Scenario banner */}
      <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <span style={{ color: '#06B6D4', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mission Briefing</span>
        </div>
        {level.lab?.scenario && (
          <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px' }}>{level.lab.scenario}</p>
        )}
        <div style={{ background: '#0A0E1A', border: '1px solid #374151', borderRadius: '6px', padding: '12px 16px' }}>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginRight: '8px' }}>Objective:</span>
          <span style={{ color: '#F9FAFB', fontSize: '13px' }}>{level.lab?.objective}</span>
        </div>
      </div>

      {/* Start lab button */}
      {labStatus === 'idle' && (
        <button onClick={startLab} style={{ padding: '14px 28px', background: '#06B6D4', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ▶ Start Lab Environment
        </button>
      )}

      {labStatus === 'starting' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#9CA3AF', fontSize: '13px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #06B6D4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          Setting up lab environment in LocalStack...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {labStatus === 'ready' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: '8px', color: '#10B981', fontSize: '13px', fontWeight: 600, alignSelf: 'flex-start' }}>
          ✓ Lab Environment Ready — LocalStack Active
        </div>
      )}

      {labStatus === 'failed' && (
        <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: '8px', color: '#EF4444', fontSize: '13px' }}>
          ⚠ Lab setup failed. Make sure LocalStack is running, then click Reset Lab.
          <button onClick={startLab} style={{ marginLeft: '12px', padding: '4px 12px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Steps — only show after lab is ready */}
      {labStatus === 'ready' && steps.map((step, i) => {
        const isLocked = i > 0 && !completedSteps.has(i - 1)
        const isComplete = completedSteps.has(i)
        return (
          <div key={i} style={{ background: '#111827', border: `1px solid ${isComplete ? '#10B981' : isLocked ? '#1F2937' : '#374151'}`, borderRadius: '8px', overflow: 'hidden', opacity: isLocked ? 0.5 : 1 }}>
            {/* Step header */}
            <div style={{ background: '#1F2937', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${isComplete ? '#10B981' : '#374151'}` }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0, background: isComplete ? '#10B981' : isLocked ? '#374151' : '#06B6D4', color: isComplete || isLocked ? '#fff' : '#000' }}>
                {isComplete ? '✓' : isLocked ? '🔒' : i + 1}
              </span>
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {i + 1} of {steps.length}</div>
                <div style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '14px' }}>{step.instruction}</div>
              </div>
            </div>

            {!isLocked && (
              <div style={{ padding: '20px' }}>
                {/* Command box */}
                <div style={{ background: '#0A0E1A', border: '1px solid #374151', borderRadius: '6px', padding: '14px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <code style={{ color: '#10B981', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', lineHeight: '1.6', flex: 1, wordBreak: 'break-all' }}>
                    $ {step.command}
                  </code>
                  <button onClick={() => copyCommand(step.command, i)} style={{ padding: '4px 10px', background: copied === i ? '#10B981' : '#374151', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', transition: 'background 150ms' }}>
                    {copied === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Expected output */}
                {step.expected_output_contains && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Expected Output:</div>
                    <div style={{ background: '#0A0E1A', border: '1px solid #1F2937', borderRadius: '6px', padding: '12px 16px' }}>
                      <code style={{ color: '#6B7280', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {step.expected_output_contains}
                      </code>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {step.explanation && (
                  <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>{step.explanation}</p>
                )}

                {/* Mark complete button */}
                {!isComplete && (
                  <button onClick={() => setCompletedSteps(prev => new Set([...prev, i]))} style={{ padding: '8px 20px', background: 'transparent', color: '#06B6D4', border: '1px solid #06B6D4', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    ✓ Mark Step Complete
                  </button>
                )}
                {isComplete && (
                  <div style={{ color: '#10B981', fontSize: '13px', fontWeight: 600 }}>✓ Step completed</div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Answer submission */}
      {labStatus === 'ready' && allStepsComplete && (
        <div style={{ background: '#111827', border: '1px solid #F59E0B', borderRadius: '8px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px' }}>🏁</span>
            <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>Submit Your Answer</span>
          </div>
          <p style={{ color: '#D1D5DB', fontSize: '14px', marginBottom: '16px' }}>{level.lab?.validation?.question || 'Enter the answer to complete this lab'}</p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleValidate()}
              placeholder="Your answer..."
              style={{ flex: 1, background: '#0A0E1A', border: '1px solid #374151', borderRadius: '6px', padding: '10px 14px', color: '#F9FAFB', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', outline: 'none' }}
            />
            <button onClick={handleValidate} style={{ padding: '10px 24px', background: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Validate
            </button>
          </div>

          {validation && (
            <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '6px', background: validation.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${validation.passed ? '#10B981' : '#EF4444'}` }}>
              <span style={{ color: validation.passed ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                {validation.passed ? '✅ Correct! Lab Complete!' : (validation.feedback || '❌ Incorrect — check your answer')}
              </span>
              {validation.passed && (
                <button onClick={onComplete} style={{ marginLeft: '16px', padding: '6px 16px', background: '#10B981', color: '#000', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hints */}
      {labStatus === 'ready' && level.lab?.hints && level.lab.hints.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ color: '#6B7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            💡 Hints ({level.lab.hints.length} available)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {level.lab.hints.map((hint, i) => (
              <HintBox key={i} hint={hint} index={i} xpCost={25} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { LabPanel }
