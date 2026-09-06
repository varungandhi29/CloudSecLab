import React, { useState } from 'react'
import { LevelDetail } from '../../types'

interface TheoryPanelProps {
  level: LevelDetail
  onComplete: () => void
}

export default function TheoryPanel({ level, onComplete }: TheoryPanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})
  const [taskResults, setTaskResults] = useState<Record<number, boolean>>({})
  const [taskAnswered, setTaskAnswered] = useState<Record<number, boolean>>(() => {
    if (level.user_progress?.theory_completed && level.tasks) {
      const initial: Record<number, boolean> = {}
      level.tasks.forEach((_, idx) => { initial[idx] = true })
      return initial
    }
    return {}
  })

  const handleSubmitTask = (i: number) => {
    const task = level.tasks?.[i]
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
      const accepted = (task.question.accepted_answers || []).map(a => a.trim().toLowerCase())
      if (val && (val === correct || accepted.includes(val))) {
        isCorrect = true
      }
    }

    setTaskResults(prev => ({ ...prev, [i]: isCorrect }))
    if (isCorrect) {
      setTaskAnswered(prev => ({ ...prev, [i]: true }))
    }
  }

  const tasksCount = level.tasks?.length || 0
  const answeredCount = Object.keys(taskAnswered).filter(k => taskAnswered[Number(k)]).length
  const allTasksAnswered = tasksCount === 0 || answeredCount === tasksCount || !!level.user_progress?.theory_completed

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', minHeight: '600px' }}>
      {/* LEFT — Table of Contents */}
      <div style={{ position: 'sticky', top: '24px', height: 'fit-content', background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '16px' }}>
        <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Contents</div>
        {level.theory.sections.map((section, i) => (
          <a
            key={i}
            href={`#section-${i}`}
            style={{
              display: 'block',
              padding: '6px 8px',
              color: '#9CA3AF',
              fontSize: '12px',
              textDecoration: 'none',
              borderRadius: '4px',
              marginBottom: '2px',
              borderLeft: '2px solid transparent',
              transition: 'all 150ms'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#06B6D4'; e.currentTarget.style.borderLeftColor = '#06B6D4' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderLeftColor = 'transparent' }}
          >
            {section.heading}
          </a>
        ))}
        {level.tasks && level.tasks.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #374151' }}>
            <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Tasks</div>
            {level.tasks.map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', fontSize: '12px', color: taskAnswered[i] ? '#10B981' : '#9CA3AF' }}>
                <span>{taskAnswered[i] ? '✓' : '○'}</span>
                <span>Task {task.task_number}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Intro */}
        {level.theory.intro && (
          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #06B6D4' }}>
            <p style={{ color: '#D1D5DB', fontSize: '15px', lineHeight: '1.8', margin: 0 }}>{level.theory.intro}</p>
          </div>
        )}

        {/* Theory sections */}
        {level.theory.sections.map((section, i) => (
          <div key={i} id={`section-${i}`}>
            {section.type === 'text' && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#F9FAFB', fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#06B6D4', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  {section.heading}
                </h3>
                <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>{section.content}</p>
              </div>
            )}
            {section.type === 'callout' && (
              <div style={{
                background: section.callout_type === 'warning' ? 'rgba(245,158,11,0.1)' : section.callout_type === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(6,182,212,0.1)',
                border: `1px solid ${section.callout_type === 'warning' ? '#F59E0B' : section.callout_type === 'danger' ? '#EF4444' : '#06B6D4'}`,
                borderLeft: `4px solid ${section.callout_type === 'warning' ? '#F59E0B' : section.callout_type === 'danger' ? '#EF4444' : '#06B6D4'}`,
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{section.callout_type === 'warning' ? '⚠️' : section.callout_type === 'danger' ? '🚨' : 'ℹ️'}</span>
                  <span style={{
                    color: section.callout_type === 'warning' ? '#F59E0B' : section.callout_type === 'danger' ? '#EF4444' : '#06B6D4',
                    fontWeight: 700,
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {section.callout_type === 'warning' ? 'Real World Example' : section.callout_type === 'danger' ? 'Critical Warning' : 'Key Insight'}
                  </span>
                </div>
                <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{section.content}</p>
              </div>
            )}
          </div>
        ))}

        {/* Key Terms Grid */}
        {level.theory.key_terms && level.theory.key_terms.length > 0 && (
          <div>
            <h3 style={{ color: '#F9FAFB', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>📖 Key Terms</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {level.theory.key_terms.map((kt, i) => (
                <div key={i} style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ color: '#06B6D4', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{kt.term}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.6' }}>{kt.definition}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Boxes */}
        {level.tasks?.map((task, i) => (
          <div key={i} style={{ background: '#111827', border: `1px solid ${taskAnswered[i] ? '#10B981' : '#374151'}`, borderRadius: '8px', overflow: 'hidden' }}>
            {/* Task header */}
            <div style={{ background: '#1F2937', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #374151' }}>
              <span style={{ background: '#06B6D4', color: '#000', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                TASK {task.task_number}
              </span>
              <span style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '14px' }}>{task.title}</span>
              {taskAnswered[i] && <span style={{ marginLeft: 'auto', color: '#10B981', fontSize: '18px' }}>✓</span>}
            </div>

            {/* Task body */}
            <div style={{ padding: '20px' }}>
              <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.7', marginBottom: '20px' }}>{task.description}</p>

              {/* Question */}
              <div style={{ background: '#0A0E1A', border: '1px solid #374151', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ color: '#F9FAFB', fontSize: '14px', fontWeight: 500, marginBottom: '16px', display: 'flex', gap: '8px' }}>
                  <span>❓</span>
                  <span>{task.question.text}</span>
                </div>

                {/* Multiple choice */}
                {task.question.type === 'multiple_choice' && task.question.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {task.question.options.map((opt, j) => (
                      <label key={j} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px 14px',
                        background: selectedAnswers[i] === j ? (j === task.question.correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : '#1F2937',
                        border: `1px solid ${selectedAnswers[i] === j ? (j === task.question.correct ? '#10B981' : '#EF4444') : '#374151'}`,
                        borderRadius: '6px',
                        cursor: taskAnswered[i] ? 'default' : 'pointer',
                        transition: 'all 150ms'
                      }}>
                        <input
                          type="radio"
                          name={`task-${i}`}
                          value={j}
                          disabled={taskAnswered[i]}
                          checked={selectedAnswers[i] === j}
                          onChange={() => setSelectedAnswers(prev => ({ ...prev, [i]: j }))}
                          style={{ marginTop: '2px', accentColor: '#06B6D4' }}
                        />
                        <span style={{ color: '#D1D5DB', fontSize: '13px', lineHeight: '1.5' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Text input */}
                {task.question.type === 'text_input' && (
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    disabled={taskAnswered[i]}
                    value={textAnswers[i] || ''}
                    onChange={e => setTextAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    style={{
                      width: '100%',
                      background: '#0A0E1A',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      color: '#F9FAFB',
                      fontSize: '13px',
                      fontFamily: 'JetBrains Mono, monospace',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                )}
              </div>

              {/* Submit button */}
              {!taskAnswered[i] && (
                <button
                  onClick={() => handleSubmitTask(i)}
                  style={{
                    padding: '8px 20px',
                    background: '#06B6D4',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Submit Answer
                </button>
              )}

              {/* Feedback */}
              {taskResults[i] !== undefined && (
                <div style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  borderRadius: '6px',
                  background: taskResults[i] ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${taskResults[i] ? '#10B981' : '#EF4444'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{taskResults[i] ? '✅' : '❌'}</span>
                    <span style={{ color: taskResults[i] ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: '13px' }}>
                      {taskResults[i] ? 'Correct!' : 'Incorrect — try again'}
                    </span>
                  </div>
                  {taskResults[i] && (
                    <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                      {task.question.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Complete button */}
        <button
          onClick={onComplete}
          disabled={!allTasksAnswered}
          style={{
            padding: '14px 32px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: allTasksAnswered ? 'pointer' : 'not-allowed',
            background: allTasksAnswered ? '#06B6D4' : '#374151',
            color: allTasksAnswered ? '#000' : '#6B7280',
            border: 'none',
            alignSelf: 'flex-start'
          }}
        >
          {allTasksAnswered ? '✓ Mark Theory Completed' : `Complete all tasks to continue (${answeredCount}/${tasksCount})`}
        </button>
      </div>
    </div>
  )
}

export { TheoryPanel }
