import React, { useState, useEffect } from 'react'
import { LevelDetail } from '../../types'
import { ConceptDiagram } from './ConceptDiagram'
import { Callout, CalloutType } from '../ui/Callout'
import { CodeBlock } from '../ui/CodeBlock'
import { CheckCircle2, HelpCircle, Check, ArrowRight } from 'lucide-react'
import { notify } from '../../store/toastStore'

interface TheoryPanelProps {
  level: LevelDetail
  onComplete: () => Promise<void> | void
  onStepProgressChange?: (completedCount: number, totalCount: number) => void
}

export const TheoryPanel: React.FC<TheoryPanelProps> = ({
  level,
  onComplete,
  onStepProgressChange,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})
  const [taskResults, setTaskResults] = useState<Record<number, boolean>>({})
  const [taskAnswered, setTaskAnswered] = useState<Record<number, boolean>>(() => {
    if (level.user_progress?.theory_completed && level.tasks) {
      const initial: Record<number, boolean> = {}
      level.tasks.forEach((_, idx) => {
        initial[idx] = true
      })
      return initial
    }
    return {}
  })
  const [submitting, setSubmitting] = useState(false)

  const tasks = level.tasks || []
  const answeredCount = Object.keys(taskAnswered).filter((k) => taskAnswered[Number(k)]).length
  const totalTasks = tasks.length
  const allTasksAnswered =
    totalTasks === 0 || answeredCount === totalTasks || !!level.user_progress?.theory_completed

  useEffect(() => {
    onStepProgressChange?.(answeredCount, totalTasks > 0 ? totalTasks : 1)
  }, [answeredCount, totalTasks, onStepProgressChange])

  const handleSubmitTask = (i: number) => {
    const task = tasks[i]
    if (!task) return

    let isCorrect = false
    if (task.question.type === 'multiple_choice') {
      const selected = selectedAnswers[i]
      if (selected !== undefined && selected === task.question.correct) {
        isCorrect = true
      }
    } else if (task.question.type === 'text_input') {
      const val = (textAnswers[i] || '').trim().toLowerCase()
      const correct = (task.question.correct_answer || '').trim().toLowerCase()
      const accepted = (task.question.accepted_answers || []).map((a) => a.trim().toLowerCase())
      if (val && (val === correct || accepted.includes(val))) {
        isCorrect = true
      }
    }

    setTaskResults((prev) => ({ ...prev, [i]: isCorrect }))
    if (isCorrect) {
      setTaskAnswered((prev) => ({ ...prev, [i]: true }))
      notify.success(`Task ${task.task_number} Completed`, task.title)
    } else {
      notify.error(`Task ${task.task_number} Incorrect`, 'Review the explanation and try again.')
    }
  }

  const handleMarkTheoryRead = async () => {
    setSubmitting(true)
    try {
      await onComplete()
      notify.success('Theory Completed (+50 XP)', `Level ${level.level_id} conceptual material marked complete.`)
    } catch {
      notify.error('Error recording completion', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-writeup text-text-primary">
      {/* 1. Architecture Concept Diagram */}
      <ConceptDiagram
        levelId={level.level_id}
        title={level.title}
        category={level.category}
        track={level.track}
      />

      {/* 2. Theory Introduction */}
      {level.theory.intro && (
        <div className="bg-bg-panel border border-border-base rounded-lg p-4 sm:p-5 text-sm leading-writeup text-text-primary">
          <p className="m-0 text-[#D1D5DB] leading-relaxed">{level.theory.intro}</p>
        </div>
      )}

      {/* 3. Theory Sections */}
      <div className="space-y-5">
        {level.theory.sections.map((section, idx) => {
          if (section.type === 'callout') {
            const calloutType: CalloutType =
              section.callout_type === 'warning'
                ? 'warning'
                : section.callout_type === 'danger'
                ? 'danger'
                : section.callout_type === 'success'
                ? 'tip'
                : 'insight'

            return (
              <Callout key={idx} type={calloutType} title={section.heading}>
                {section.content}
              </Callout>
            )
          }

          if (section.type === 'code') {
            return (
              <div key={idx} className="space-y-1.5">
                <h3 className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider">
                  {section.heading}
                </h3>
                <CodeBlock code={section.content} />
              </div>
            )
          }

          return (
            <div key={idx} className="space-y-2">
              <h3 className="text-sm font-semibold text-text-primary font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-bg-panel border border-border-base text-accent-teal text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span>{section.heading}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#C8D1DC] leading-writeup font-sans m-0 pl-7">
                {section.content}
              </p>
            </div>
          )
        })}
      </div>

      {/* 4. Key Terms Glossary */}
      {level.theory.key_terms && level.theory.key_terms.length > 0 && (
        <div className="pt-4 border-t border-border-base space-y-2.5">
          <h3 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
            Key Terminology
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {level.theory.key_terms.map((kt, i) => (
              <div
                key={i}
                className="bg-bg-panel border border-border-base rounded-md p-3 text-xs space-y-1"
              >
                <div className="font-mono font-semibold text-accent-teal">{kt.term}</div>
                <div className="text-text-muted text-[11px] leading-normal">{kt.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Guided Tasks / Checkpoint Steps */}
      {tasks.length > 0 && (
        <div className="pt-6 border-t border-border-base space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
              Concept Checkpoints ({answeredCount}/{tasks.length})
            </h3>
            <span className="text-[11px] font-mono text-text-muted">
              Tick checkpoints to confirm understanding
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, i) => {
              const isAnswered = taskAnswered[i]

              return (
                <div
                  key={i}
                  className={`bg-bg-panel border rounded-lg overflow-hidden transition-all ${
                    isAnswered ? 'border-accent-teal/40' : 'border-border-base'
                  }`}
                >
                  {/* Task Header */}
                  <div className="px-4 py-2.5 bg-bg-panel-subtle border-b border-border-base flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="bg-bg-base border border-border-base text-accent-amber px-1.5 py-0.5 rounded text-[10px] font-bold">
                        TASK {task.task_number}
                      </span>
                      <span className="font-semibold text-text-primary">{task.title}</span>
                    </div>

                    {isAnswered && (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-accent-teal">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </span>
                    )}
                  </div>

                  {/* Task Body */}
                  <div className="p-4 space-y-3 text-xs">
                    <p className="text-text-muted leading-relaxed m-0 font-sans">{task.description}</p>

                    <div className="bg-bg-base border border-border-base rounded-md p-3 space-y-2.5">
                      <div className="font-medium text-text-primary flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
                        <span>{task.question.text}</span>
                      </div>

                      {/* Multiple choice options */}
                      {task.question.type === 'multiple_choice' && task.question.options && (
                        <div className="space-y-1.5 pt-1">
                          {task.question.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`flex items-start gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                                selectedAnswers[i] === oIdx
                                  ? 'bg-accent-teal/10 border-accent-teal/40 text-text-primary font-medium'
                                  : 'bg-bg-panel border-border-subtle text-text-muted hover:border-border-base hover:text-text-primary'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`task-${i}`}
                                disabled={isAnswered}
                                checked={selectedAnswers[i] === oIdx}
                                onChange={() => setSelectedAnswers((prev) => ({ ...prev, [i]: oIdx }))}
                                className="mt-0.5 accent-[#4FB6A8]"
                              />
                              <span className="leading-snug">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Text input */}
                      {task.question.type === 'text_input' && (
                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="Type answer..."
                            disabled={isAnswered}
                            value={textAnswers[i] || ''}
                            onChange={(e) => setTextAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && !isAnswered && handleSubmitTask(i)}
                            className="w-full bg-bg-input border border-border-base rounded px-3 py-1.5 text-xs text-text-primary font-mono focus-visible:ring-1 focus-visible:ring-accent-amber"
                          />
                        </div>
                      )}

                      {/* Submit button */}
                      {!isAnswered && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleSubmitTask(i)}
                            className="px-3 py-1.5 bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal border border-accent-teal/40 rounded text-xs font-mono font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
                          >
                            Check Answer
                          </button>
                        </div>
                      )}

                      {/* Explanation Callout */}
                      {taskResults[i] && task.question.explanation && (
                        <div className="p-2.5 bg-bg-panel border border-accent-teal/30 rounded text-[11px] text-[#C8D1DC] leading-relaxed">
                          <span className="font-semibold text-accent-teal block mb-0.5">Explanation:</span>
                          {task.question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 6. Mark Theory Complete Button */}
      <div className="pt-4 border-t border-border-base flex items-center justify-between">
        <button
          type="button"
          onClick={handleMarkTheoryRead}
          disabled={!allTasksAnswered || submitting || level.user_progress?.theory_completed}
          className={`px-4 py-2.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
            level.user_progress?.theory_completed
              ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/40 cursor-default'
              : allTasksAnswered
              ? 'bg-accent-teal text-bg-base hover:bg-accent-teal/90 shadow-sm cursor-pointer'
              : 'bg-bg-panel border border-border-base text-text-muted cursor-not-allowed opacity-60'
          }`}
        >
          {level.user_progress?.theory_completed ? (
            <>
              <Check className="w-4 h-4 text-accent-teal" />
              <span>Theory Completed (+50 XP Earned)</span>
            </>
          ) : (
            <>
              <span>{allTasksAnswered ? 'Mark Theory Completed (+50 XP)' : `Complete ${tasks.length - answeredCount} remaining tasks`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default TheoryPanel
