import React, { useState } from 'react'
import { api } from '../../services/api'
import { LevelDetail, ForensicsQuestion as IForensicsQuestion } from '../../types'
import { Search, CheckCircle2, AlertCircle, Terminal } from 'lucide-react'
import { notify } from '../../store/toastStore'

interface ForensicsViewerProps {
  level: LevelDetail
  levelId: number
  onComplete: () => void
}

function ForensicsQuestionRow({
  question,
  index,
  value,
  onAnswerChange,
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
    const accepted = (question.accepted_answers || []).map((a) => a.trim().toLowerCase())
    const correctMatch = (correct && val === correct) || accepted.includes(val)
    setChecked(true)
    setIsCorrect(correctMatch)
  }

  return (
    <div
      className={`bg-bg-panel border rounded-lg p-3.5 space-y-2 text-xs transition-colors ${
        checked
          ? isCorrect
            ? 'border-accent-teal/40'
            : 'border-accent-danger/40'
          : 'border-border-base'
      }`}
    >
      <div className="font-medium text-text-primary flex items-start gap-2">
        <span className="font-mono text-accent-amber font-semibold">Q{index + 1}:</span>
        <span className="leading-snug">{text}</span>
      </div>

      {question.hint && (
        <div className="text-[11px] text-text-muted italic pl-5">
          💡 Hint: {question.hint}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onAnswerChange(e.target.value)
            setChecked(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Type analysis answer..."
          className="flex-1 bg-bg-input border border-border-base rounded px-3 py-1.5 text-xs text-text-primary font-mono focus-visible:ring-1 focus-visible:ring-accent-amber"
        />
        <button
          type="button"
          onClick={handleCheck}
          className="px-3 py-1.5 bg-bg-base hover:bg-bg-input text-text-primary border border-border-base rounded text-xs font-mono font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
        >
          Check
        </button>
      </div>

      {checked && (
        <div
          className={`text-[11px] font-mono font-semibold ${
            isCorrect ? 'text-accent-teal' : 'text-accent-danger'
          }`}
        >
          {isCorrect ? '✓ Correct finding' : '✗ Incorrect — inspect log events closely'}
        </div>
      )}
    </div>
  )
}

export const ForensicsViewer: React.FC<ForensicsViewerProps> = ({ level, levelId, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [submitFeedback, setSubmitFeedback] = useState<{ passed?: boolean; message?: string } | null>(
    level.user_progress?.forensics_completed
      ? { passed: true, message: 'Forensics Investigation Completed! (+100 XP)' }
      : null
  )

  const forensics = level.forensics
  if (!forensics) return null

  const logEntries = forensics.log_entries || forensics.log_data || []

  const filteredLogs = logEntries.filter((entry) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return JSON.stringify(entry).toLowerCase().includes(term)
  })

  const handleSubmitAll = async () => {
    try {
      const res = await api.post(`/progress/${levelId}/forensics`, { answers })
      if (res.data.passed) {
        setSubmitFeedback({ passed: true, message: 'Investigation Completed! (+100 XP awarded)' })
        notify.success('Forensics Solved (+100 XP)', 'Attack reconstruction verified.')
        onComplete()
      } else {
        setSubmitFeedback({
          passed: false,
          message: `${res.data.correct_count}/${res.data.total_questions} questions correct. Review logs and try again.`,
        })
        notify.error('Investigation Incomplete', 'Some answers were incorrect.')
      }
    } catch {
      setSubmitFeedback({ passed: false, message: 'Error submitting answers. Please try again.' })
    }
  }

  return (
    <div className="space-y-4 text-xs text-text-primary">
      {/* Scenario Briefing */}
      <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-accent-danger font-mono font-semibold text-xs uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          <span>Incident Scenario</span>
        </div>
        <p className="text-[#C8D1DC] text-xs leading-relaxed m-0 font-sans">{forensics.scenario}</p>
      </div>

      {/* CloudTrail Log Evidence Viewer */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-mono font-semibold text-text-muted text-[11px] uppercase tracking-wider">
            CloudTrail Log Evidence ({filteredLogs.length} Events)
          </span>
          <div className="relative">
            <Search className="w-3 h-3 text-text-muted absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter logs by IP, event, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg-input border border-border-base rounded pl-7 pr-2.5 py-1 text-[11px] text-text-primary font-mono w-56 focus-visible:ring-1 focus-visible:ring-accent-amber"
            />
          </div>
        </div>

        <div className="bg-bg-input border border-border-base rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-bg-panel border-b border-border-base font-mono text-[10px] text-text-muted uppercase font-semibold">
            <div>Timestamp</div>
            <div>Event</div>
            <div>Identity</div>
            <div>Source IP</div>
          </div>

          {/* Log Rows */}
          <div className="divide-y divide-border-subtle max-h-56 overflow-y-auto font-mono text-[11px]">
            {filteredLogs.map((entry, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 px-3 py-1.5 hover:bg-bg-panel/60 transition-colors">
                <div className="text-text-muted truncate">
                  {entry.eventTime ? entry.eventTime.replace('T', ' ').replace('Z', '') : 'N/A'}
                </div>
                <div className="text-accent-danger font-semibold truncate">{entry.eventName || 'N/A'}</div>
                <div className="text-accent-teal truncate">
                  {typeof entry.userIdentity === 'object'
                    ? entry.userIdentity?.userName || entry.userIdentity?.arn || 'Unknown'
                    : entry.userIdentity || 'Unknown'}
                </div>
                <div className="text-text-muted truncate">{entry.sourceIPAddress || '127.0.0.1'}</div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="p-4 text-center text-text-muted font-mono text-xs">
                No log entries match your filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investigation Questions */}
      <div className="space-y-2.5 pt-2">
        <span className="font-mono font-semibold text-text-muted text-[11px] uppercase tracking-wider block">
          Investigation Questions
        </span>
        <div className="space-y-2.5">
          {forensics.questions?.map((q, i) => (
            <ForensicsQuestionRow
              key={i}
              question={q}
              index={i}
              value={answers[i.toString()] || ''}
              onAnswerChange={(val) => setAnswers((prev) => ({ ...prev, [i.toString()]: val }))}
            />
          ))}
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSubmitAll}
            className="self-start px-4 py-2 bg-accent-danger/20 hover:bg-accent-danger/30 text-accent-danger border border-accent-danger/40 rounded text-xs font-mono font-bold transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
          >
            Submit Forensics Investigation
          </button>

          {submitFeedback && (
            <div
              className={`p-2.5 rounded border text-xs font-mono ${
                submitFeedback.passed
                  ? 'bg-accent-teal/10 border-accent-teal/40 text-accent-teal'
                  : 'bg-accent-danger/10 border-accent-danger/40 text-accent-danger'
              }`}
            >
              {submitFeedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForensicsViewer
