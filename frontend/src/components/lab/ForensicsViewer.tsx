import React, { useState } from 'react'
import { api } from '../../services/api'
import { LevelDetail, ForensicsQuestion as IForensicsQuestion } from '../../types'

interface ForensicsViewerProps {
  level: LevelDetail
  levelId: number
  onComplete: () => void
}

function ForensicsQuestion({
  question,
  index,
  value,
  onAnswerChange
}: {
  question: IForensicsQuestion
  index: number
  value: string
  onAnswerChange: (val: string) => void
}) {
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const text = question.text || question.question || `Question ${index + 1}`

  const handleCheck = () => {
    if (!value.trim()) return
    const val = value.trim().toLowerCase()
    const correct = (question.correct || question.correct_answer || '').trim().toLowerCase()
    const accepted = (question.accepted_answers || []).map(a => a.trim().toLowerCase())
    const correctMatch = (correct && val === correct) || accepted.includes(val)
    setChecked(true)
    setIsCorrect(correctMatch)
  }

  return (
    <div style={{ background: '#111827', border: `1px solid ${checked ? (isCorrect ? '#10B981' : '#EF4444') : '#374151'}`, borderRadius: '8px', padding: '16px 20px' }}>
      <div style={{ color: '#F9FAFB', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <span style={{ color: '#EF4444', fontFamily: 'JetBrains Mono, monospace' }}>Q{index + 1}:</span>
        <span>{text}</span>
      </div>
      {question.hint && (
        <div style={{ color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic', marginBottom: '12px' }}>
          💡 Hint: {question.hint}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={value}
          onChange={e => {
            onAnswerChange(e.target.value)
            setChecked(false)
          }}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          placeholder="Type your answer..."
          style={{
            flex: 1,
            background: '#0A0E1A',
            border: '1px solid #374151',
            borderRadius: '6px',
            padding: '10px 14px',
            color: '#F9FAFB',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            outline: 'none'
          }}
        />
        <button
          onClick={handleCheck}
          style={{ padding: '8px 18px', background: '#374151', color: '#F9FAFB', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
        >
          Check
        </button>
      </div>
      {checked && (
        <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: isCorrect ? '#10B981' : '#EF4444' }}>
          {isCorrect ? '✅ Correct!' : '❌ Incorrect — try again'}
        </div>
      )}
    </div>
  )
}

export default function ForensicsViewer({ level, levelId, onComplete }: ForensicsViewerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [submitFeedback, setSubmitFeedback] = useState<{ passed?: boolean; message?: string } | null>(
    level.user_progress?.forensics_completed ? { passed: true, message: 'Investigation Completed! (+100 XP)' } : null
  )

  const forensics = level.forensics
  if (!forensics) return null

  const logEntries = forensics.log_entries || forensics.log_data || []

  const filteredLogs = logEntries.filter(entry => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return JSON.stringify(entry).toLowerCase().includes(term)
  })

  const handleSubmitAll = async () => {
    try {
      const res = await api.post(`/progress/${levelId}/forensics`, { answers })
      if (res.data.passed) {
        setSubmitFeedback({ passed: true, message: '✅ Forensics Investigation Completed! (+100 XP)' })
        onComplete?.()
      } else {
        setSubmitFeedback({
          passed: false,
          message: `❌ ${res.data.correct_count}/${res.data.total_questions} questions correct. Review logs and try again.`
        })
      }
    } catch {
      setSubmitFeedback({ passed: false, message: '❌ Error submitting answers. Please try again.' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Scenario */}
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '18px' }}>🔍</span>
          <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Forensics Investigation</span>
        </div>
        <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{forensics.scenario}</p>
      </div>

      {/* CloudTrail log table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📋 CloudTrail Log Evidence ({filteredLogs.length} Events)
          </div>
          <input
            type="text"
            placeholder="Filter logs by keyword, IP, event..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: '#0A0E1A',
              border: '1px solid #374151',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#F9FAFB',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              outline: 'none',
              width: '260px'
            }}
          />
        </div>
        <div style={{ background: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 200px 160px 1fr', padding: '10px 16px', background: '#111827', borderBottom: '1px solid #374151' }}>
            {['Timestamp', 'Event', 'User', 'Source IP'].map(h => (
              <div key={h} style={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>

          {/* Log rows */}
          {filteredLogs.map((entry, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 200px 160px 1fr',
                padding: '10px 16px',
                borderBottom: i < filteredLogs.length - 1 ? '1px solid #1F2937' : 'none',
                transition: 'background 150ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#111827'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ color: '#9CA3AF', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
                {entry.eventTime ? (isNaN(Date.parse(entry.eventTime)) ? entry.eventTime : new Date(entry.eventTime).toLocaleString()) : 'N/A'}
              </div>
              <div style={{ color: '#EF4444', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {entry.eventName || 'N/A'}
              </div>
              <div style={{ color: '#06B6D4', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                {typeof entry.userIdentity === 'object' ? entry.userIdentity?.userName || entry.userIdentity?.arn || 'Unknown' : entry.userIdentity || 'Unknown'}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                {entry.sourceIPAddress || '127.0.0.1'}
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
              No log entries match search query.
            </div>
          )}
        </div>
      </div>

      {/* Investigation questions */}
      <div>
        <div style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          🕵️ Investigation Questions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {forensics.questions?.map((q, i) => (
            <ForensicsQuestion
              key={i}
              question={q}
              index={i}
              value={answers[i.toString()] || ''}
              onAnswerChange={val => setAnswers(prev => ({ ...prev, [i.toString()]: val }))}
            />
          ))}
        </div>

        {/* Submit button */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleSubmitAll}
            style={{
              padding: '12px 28px',
              background: '#EF4444',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Submit Forensics Investigation
          </button>

          {submitFeedback && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '6px',
              background: submitFeedback.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${submitFeedback.passed ? '#10B981' : '#EF4444'}`,
              color: submitFeedback.passed ? '#10B981' : '#EF4444',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {submitFeedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { ForensicsViewer }
