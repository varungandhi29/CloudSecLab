import React, { useState } from 'react'
import { HelpCircle, CheckCircle, AlertCircle } from 'lucide-react'

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

  const handleChange = (id: number, val: any) => {
    setAnswers((prev) => ({ ...prev, [id.toString()]: val }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(answers)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h3 className="text-lg font-bold text-gray-100 flex items-center">
          <HelpCircle className="w-5 h-5 text-cyan-400 mr-2" />
          Problem Solving Assessment
        </h3>
        {lastScore !== undefined && (
          <span className={`font-mono text-sm font-bold px-3 py-1 rounded-full ${
            lastScore >= 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            Last Score: {lastScore.toFixed(0)}%
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="font-semibold text-gray-200 text-sm flex items-start space-x-2">
              <span className="text-cyan-400 font-mono">Q{idx + 1}.</span>
              <span>{q.question}</span>
            </div>

            {q.policy && (
              <div className="bg-black/60 p-3 rounded-lg border border-gray-800 font-mono text-xs text-amber-300">
                <pre>{JSON.stringify(q.policy, null, 2)}</pre>
              </div>
            )}

            {q.type === 'multiple_choice' && q.options && (
              <div className="space-y-2 pt-1">
                {q.options.map((opt, oIdx) => (
                  <label
                    key={oIdx}
                    className={`flex items-center space-x-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                      answers[q.id.toString()] === opt
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-medium'
                        : 'border-gray-800 bg-gray-950/40 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt}
                      checked={answers[q.id.toString()] === opt}
                      onChange={() => handleChange(q.id, opt)}
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{opt}</span>
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
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-800 flex justify-end">
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-6 py-2.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-sm"
        >
          Submit Problem Solving Answers
        </button>
      </div>
    </form>
  )
}
