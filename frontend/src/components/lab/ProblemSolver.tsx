import React, { useState } from 'react'
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react'

interface Question {
  id: number
  type: 'multiple_choice' | 'policy_analysis' | 'scenario'
  question: string
  options?: string[]
  policy?: any
  explanation?: string
}

interface ProblemSolverProps {
  questions: Question[]
  onSubmit: (answers: Record<string, any>) => void
  lastScore?: number
}

export const ProblemSolver: React.FC<ProblemSolverProps> = ({ questions, onSubmit, lastScore }) => {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (id: number, val: any) => {
    setAnswers((prev) => ({ ...prev, [id.toString()]: val }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    onSubmit(answers)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-bg-panel border border-border-base rounded-lg p-4 sm:p-5 text-xs text-text-primary">
      <div className="flex items-center justify-between border-b border-border-base pb-3">
        <h3 className="font-mono font-bold text-xs text-text-primary flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent-teal" />
          <span>Problem Solving Assessment</span>
        </h3>
        {lastScore !== undefined && (
          <span
            className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              lastScore >= 70
                ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/40'
                : 'bg-accent-amber/15 text-accent-amber border-accent-amber/40'
            }`}
          >
            Last Score: {lastScore.toFixed(0)}%
          </span>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-bg-base border border-border-base rounded-lg p-3.5 space-y-2.5">
            <div className="font-semibold text-text-primary flex items-start gap-2">
              <span className="text-accent-teal font-mono">Q{idx + 1}.</span>
              <span className="leading-snug">{q.question}</span>
            </div>

            {q.policy && (
              <div className="bg-bg-input p-2.5 rounded border border-border-subtle font-mono text-[11px] text-accent-amber overflow-x-auto">
                <pre>{JSON.stringify(q.policy, null, 2)}</pre>
              </div>
            )}

            {q.type === 'multiple_choice' && q.options && (
              <div className="space-y-1.5 pt-1">
                {q.options.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    className={`flex items-start gap-2.5 p-2 rounded border text-xs cursor-pointer transition-colors ${
                      answers[q.id.toString()] === opt
                        ? 'border-accent-teal/50 bg-accent-teal/10 text-text-primary font-medium'
                        : 'border-border-subtle bg-bg-panel text-text-muted hover:text-text-primary hover:border-border-base'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt}
                      checked={answers[q.id.toString()] === opt}
                      onChange={() => handleChange(q.id, opt)}
                      className="mt-0.5 accent-[#4FB6A8]"
                    />
                    <span className="leading-snug">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type !== 'multiple_choice' && (
              <textarea
                rows={3}
                placeholder="Type your security analysis answer..."
                value={answers[q.id.toString()] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full bg-bg-input border border-border-base rounded p-2.5 text-xs text-text-primary font-mono placeholder:text-text-muted/60 focus-visible:ring-1 focus-visible:ring-accent-amber"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border-base flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-mono font-bold px-4 py-2 rounded text-xs transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
        >
          Submit Problem Solving Answers
        </button>
      </div>
    </form>
  )
}

export default ProblemSolver
