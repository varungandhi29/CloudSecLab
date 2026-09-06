import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Terminal as TerminalIcon, HelpCircle, Search, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { api } from '../services/api'
import { LevelDetail as ILevelDetail } from '../types'
import TheoryPanel from '../components/lab/TheoryPanel'
import LabPanel from '../components/lab/LabPanel'
import { ProblemSolver } from '../components/lab/ProblemSolver'
import ForensicsViewer from '../components/lab/ForensicsViewer'

export const LevelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const levelId = parseInt(id || '1', 10)
  const navigate = useNavigate()

  const [level, setLevel] = useState<ILevelDetail | null>(null)
  const [activeTab, setActiveTab] = useState<'theory' | 'lab' | 'problems' | 'forensics'>('theory')

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const res = await api.get(`/levels/${levelId}`)
        setLevel(res.data)
      } catch (e) {
        navigate('/levels')
      }
    }
    fetchLevel()
  }, [levelId])

  if (!level) return null

  const handleMarkTheoryRead = async () => {
    try {
      await api.post(`/levels/${levelId}/theory/complete`)
      setLevel({
        ...level,
        user_progress: { ...level.user_progress, theory_completed: true },
      })
    } catch (e) {}
  }

  const handleProblemSubmit = async (answers: Record<string, any>) => {
    try {
      const res = await api.post(`/progress/${levelId}/problem-solving`, { answers })
      alert(res.data.feedback)
      if (res.data.passed) {
        setLevel({
          ...level,
          user_progress: { ...level.user_progress, problem_solving_score: res.data.score, status: 'completed' },
        })
      }
    } catch (e) {}
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Level Nav Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/levels')}
            className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-lg border border-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
              LEVEL {level.level_id.toString().padStart(3, '0')} — {level.track} Track
            </span>
            <h1 className="text-2xl font-extrabold text-white">{level.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {levelId > 1 && (
            <button
              onClick={() => navigate(`/levels/${levelId - 1}`)}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-xs font-mono text-gray-300 rounded-lg border border-gray-800"
            >
              ← Prev
            </button>
          )}
          {levelId < 100 && (
            <button
              onClick={() => navigate(`/levels/${levelId + 1}`)}
              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-400 rounded-lg border border-cyan-500/30 flex items-center"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 space-x-2">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'theory'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Theory</span>
          {level.user_progress.theory_completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'lab'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <TerminalIcon className="w-4 h-4" />
          <span>2. Practical Lab</span>
          {level.user_progress.lab_completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
        </button>

        {level.problem_solving && (
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'problems'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>3. Problem Solving</span>
            {level.user_progress.problem_solving_score >= 70 && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
          </button>
        )}

        {level.forensics?.enabled && (
          <button
            onClick={() => setActiveTab('forensics')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
              activeTab === 'forensics'
                ? 'border-red-400 text-red-400 bg-red-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>4. Cloud Forensics</span>
            {level.user_progress.forensics_completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
          </button>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'theory' && (
        <TheoryPanel
          level={level}
          onComplete={handleMarkTheoryRead}
        />
      )}

      {activeTab === 'lab' && (
        <LabPanel
          level={level}
          levelId={levelId}
          onComplete={() => {
            setLevel({
              ...level,
              user_progress: { ...level.user_progress, lab_completed: true },
            })
          }}
        />
      )}

      {activeTab === 'problems' && level.problem_solving && (
        <ProblemSolver
          questions={level.problem_solving.questions}
          onSubmit={handleProblemSubmit}
          lastScore={level.user_progress.problem_solving_score}
        />
      )}

      {activeTab === 'forensics' && level.forensics?.enabled && (
        <ForensicsViewer
          level={level}
          levelId={levelId}
          onComplete={() => {
            setLevel({
              ...level,
              user_progress: { ...level.user_progress, forensics_completed: true },
            })
          }}
        />
      )}
    </div>
  )
}

export default LevelDetail
