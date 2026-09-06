import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShieldAlert, Award, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { api } from '../services/api'
import { Timer } from '../components/ui/Timer'

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

        const startRes = await api.post(`/exams/${examId}/start`)
        const statusRes = await api.get(`/exams/${examId}/status`)
        setRemainingSeconds(statusRes.data.remaining_seconds || detailRes.data.duration_minutes * 60)
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Exam unavailable')
        navigate('/levels')
      }
    }
    initExam()
  }, [examId])

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
      alert('Error submitting exam. Please check connections.')
      setSubmitting(false)
    }
  }

  if (!examData) return null

  const theoryQuestions = examData.theory_section?.questions || []
  const practicalLabs = examData.practical_section?.labs || []

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans p-6">
      {/* Exam Header */}
      <div className="max-w-5xl mx-auto bg-card border border-amber-500/30 rounded-2xl p-6 mb-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              OFFICIAL CLOUDSECLAB EXAM
            </span>
            <h1 className="text-2xl font-extrabold text-white">{examData.title}</h1>
          </div>
        </div>

        <Timer initialSeconds={remainingSeconds} onExpire={executeSubmit} />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Theory Section */}
        {theoryQuestions.length > 0 && (
          <div className="bg-card border border-gray-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center border-b border-gray-800 pb-3">
              <span className="text-cyan-400 font-mono mr-2">SECTION 1.</span> Theory Questions ({theoryQuestions.length} Total)
            </h2>

            <div className="space-y-6">
              {theoryQuestions.map((q: any, idx: number) => (
                <div key={q.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="font-semibold text-gray-200 text-sm flex items-start space-x-2">
                    <span className="text-cyan-400 font-mono">Q{idx + 1}.</span>
                    <span>{q.question}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    {q.options.map((opt: string, oIdx: number) => (
                      <label
                        key={oIdx}
                        className={`flex items-center space-x-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                          answers.theory[q.id.toString()] === opt
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-medium'
                            : 'border-gray-800 bg-gray-950/40 text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`exam_q_${q.id}`}
                          value={opt}
                          checked={answers.theory[q.id.toString()] === opt}
                          onChange={() => handleTheoryChange(q.id.toString(), opt)}
                          className="text-amber-500 focus:ring-amber-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practical Section */}
        {practicalLabs.length > 0 && (
          <div className="bg-card border border-gray-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center border-b border-gray-800 pb-3">
              <span className="text-emerald-400 font-mono mr-2">SECTION 2.</span> Practical Objectives ({practicalLabs.length} Labs)
            </h2>

            <div className="space-y-6">
              {practicalLabs.map((lab: any, idx: number) => (
                <div key={lab.lab_id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="font-bold text-gray-100 text-sm">
                    Lab {idx + 1}: {lab.title} ({lab.points} Points)
                  </div>
                  <p className="text-xs font-mono text-cyan-300 bg-cyan-950/40 p-3 rounded-lg border border-cyan-500/20">
                    Objective: {lab.objective}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-mono text-gray-400">ENTER EXACT OBJECTIVE ANSWER / FLAG:</label>
                    <input
                      type="text"
                      placeholder="e.g. svc-deploy, company-public-assets..."
                      value={answers.practical[lab.lab_id.toString()] || ''}
                      onChange={(e) => handlePracticalChange(lab.lab_id.toString(), e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Submit Bar */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all text-base"
          >
            Submit Final Exam
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Confirm Exam Submission</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to submit? You cannot go back or modify answers after submitting.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm"
              >
                Continue Exam
              </button>
              <button
                onClick={executeSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-sm"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Exam
