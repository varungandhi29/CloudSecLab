import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Award, Clock, AlertTriangle, ArrowLeft } from 'lucide-react'
import { api } from '../services/api'
import { Timer } from '../components/ui/Timer'
import { notify } from '../store/toastStore'

export const Exam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()

  const [examData, setExamData] = useState<any>(null)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600)
  const [answers, setAnswers] = useState<{ theory: Record<string, string>; practical: Record<string, string> }>({
    theory: {},
    practical: {},
  })
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    const initExam = async () => {
      try {
        const detailRes = await api.get(`/exams/${examId}`)
        setExamData(detailRes.data)

        await api.post(`/exams/${examId}/start`)
        const statusRes = await api.get(`/exams/${examId}/status`)
        setRemainingSeconds(statusRes.data.remaining_seconds || detailRes.data.duration_minutes * 60)
      } catch (err: any) {
        notify.error('Exam Unavailable', err.response?.data?.detail || 'Unable to start exam.')
        navigate('/levels')
      }
    }
    initExam()
  }, [examId, navigate])

  const handleTheoryChange = (qId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      theory: { ...prev.theory, [qId]: val },
    }))
  }

  const handlePracticalChange = (labId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      practical: { ...prev.practical, [labId]: val },
    }))
  }

  const executeSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await api.post(`/exams/${examId}/submit`, { answers })
      navigate(`/exam/${examId}/result`, { state: { result: res.data } })
    } catch (e) {
      notify.error('Submission Failed', 'Failed to submit exam. Check network connection.')
      setSubmitting(false)
    }
  }

  if (!examData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono text-xs text-text-muted">
        Initializing Certification Exam Environment...
      </div>
    )
  }

  const theoryQuestions = examData.theory_section?.questions || []
  const practicalLabs = examData.practical_section?.labs || []

  return (
    <div className="min-h-screen bg-bg-base text-text-primary p-4 sm:p-6 font-sans text-xs">
      {/* Exam Header */}
      <div className="max-w-4xl mx-auto bg-bg-panel border border-border-base rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-bg-base border border-border-base flex items-center justify-center text-accent-amber">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-accent-amber uppercase tracking-wider">
              Official Certification Exam
            </span>
            <h1 className="text-base sm:text-lg font-bold text-text-primary font-mono">{examData.title}</h1>
          </div>
        </div>

        <Timer initialSeconds={remainingSeconds} onExpire={executeSubmit} />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section 1: Theory Questions */}
        {theoryQuestions.length > 0 && (
          <div className="bg-bg-panel border border-border-base rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider border-b border-border-base pb-2.5 flex items-center gap-1.5">
              <span className="text-accent-teal">SECTION 1:</span>
              <span>Theoretical Principles ({theoryQuestions.length} Questions)</span>
            </h2>

            <div className="space-y-4">
              {theoryQuestions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-bg-base border border-border-base rounded-lg p-4 space-y-2.5">
                  <div className="font-semibold text-text-primary flex items-start gap-2">
                    <span className="text-accent-teal font-mono">Q{idx + 1}.</span>
                    <span className="leading-snug">{q.question}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt: string, oIdx: number) => (
                      <label
                        key={oIdx}
                        className={`flex items-start gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                          answers.theory[q.id.toString()] === opt
                            ? 'border-accent-amber/50 bg-accent-amber/10 text-text-primary font-medium'
                            : 'border-border-subtle bg-bg-panel text-text-muted hover:text-text-primary hover:border-border-base'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`exam_q_${q.id}`}
                          value={opt}
                          checked={answers.theory[q.id.toString()] === opt}
                          onChange={() => handleTheoryChange(q.id.toString(), opt)}
                          className="mt-0.5 accent-[#E8A33D]"
                        />
                        <span className="leading-snug">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Practical Labs */}
        {practicalLabs.length > 0 && (
          <div className="bg-bg-panel border border-border-base rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider border-b border-border-base pb-2.5 flex items-center gap-1.5">
              <span className="text-accent-teal">SECTION 2:</span>
              <span>Practical Objectives ({practicalLabs.length} Challenges)</span>
            </h2>

            <div className="space-y-4">
              {practicalLabs.map((lab: any, idx: number) => (
                <div key={lab.lab_id} className="bg-bg-base border border-border-base rounded-lg p-4 space-y-2.5">
                  <div className="font-mono font-bold text-text-primary text-xs flex justify-between">
                    <span>Lab {idx + 1}: {lab.title}</span>
                    <span className="text-accent-amber">{lab.points} Points</span>
                  </div>

                  <p className="bg-bg-input border border-border-subtle p-2.5 rounded text-[11px] font-mono text-[#C8D1DC] leading-relaxed m-0">
                    <strong className="text-accent-teal">Objective:</strong> {lab.objective}
                  </p>

                  <div className="space-y-1 pt-1 font-mono">
                    <label className="text-[10px] text-text-muted uppercase">
                      Enter Exact Result Output / Discovered Key:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. svc-deploy, sec-prod-bucket..."
                      value={answers.practical[lab.lab_id.toString()] || ''}
                      onChange={(e) => handlePracticalChange(lab.lab_id.toString(), e.target.value)}
                      className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs font-mono text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-6 py-2.5 bg-accent-amber text-bg-base hover:bg-accent-amber/90 font-mono font-bold rounded text-xs transition-colors shadow-sm focus-visible:ring-1 focus-visible:ring-accent-teal"
          >
            Submit Final Certification Exam
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-bg-panel border border-border-base rounded-xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-accent-amber mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-text-primary font-mono">Confirm Exam Submission</h3>
              <p className="text-xs text-text-muted font-sans leading-relaxed m-0">
                Are you ready to submit your exam answers? You will not be able to modify answers after submission.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-bg-base hover:bg-bg-panel-subtle text-text-muted hover:text-text-primary border border-border-base font-mono rounded text-xs transition-colors"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                disabled={submitting}
                className="flex-1 py-2 bg-accent-amber text-bg-base hover:bg-accent-amber/90 font-mono font-bold rounded text-xs transition-colors"
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Exam
