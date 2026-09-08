import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, BookOpen, Terminal as TerminalIcon, HelpCircle, Search, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'
import { LevelDetail as ILevelDetail } from '../types'
import { TheoryPanel } from '../components/lab/TheoryPanel'
import { LabPanel } from '../components/lab/LabPanel'
import { ProblemSolver } from '../components/lab/ProblemSolver'
import { ForensicsViewer } from '../components/lab/ForensicsViewer'
import { ProgressBar } from '../components/ui/ProgressBar'
import { notify } from '../store/toastStore'

export const LevelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const levelId = parseInt(id || '1', 10)
  const navigate = useNavigate()

  const [level, setLevel] = useState<ILevelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileTab, setMobileTab] = useState<'writeup' | 'console'>('writeup')
  const [consoleTab, setConsoleTab] = useState<'lab' | 'problems' | 'forensics'>('lab')
  const [stepProgress, setStepProgress] = useState({ completed: 0, total: 1 })

  const fetchLevel = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get(`/levels/${levelId}`)
      setLevel(res.data)
    } catch (e) {
      notify.error('Level not found', `Unable to load Level ${levelId}`)
      navigate('/levels')
    } finally {
      setLoading(false)
    }
  }, [levelId, navigate])

  useEffect(() => {
    fetchLevel()
  }, [fetchLevel])

  if (loading || !level) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono text-xs text-text-muted">
        Loading Level {levelId}...
      </div>
    )
  }

  const handleTheoryComplete = async () => {
    try {
      await api.post(`/levels/${levelId}/theory/complete`)
      setLevel((prev) =>
        prev
          ? {
              ...prev,
              user_progress: { ...prev.user_progress, theory_completed: true },
            }
          : null
      )
    } catch (e) {
      throw e
    }
  }

  const handleLabComplete = () => {
    setLevel((prev) =>
      prev
        ? {
            ...prev,
            user_progress: { ...prev.user_progress, lab_completed: true, status: 'completed' },
          }
        : null
    )
  }

  const handleProblemSubmit = async (answers: Record<string, any>) => {
    try {
      const res = await api.post(`/progress/${levelId}/problem-solving`, { answers })
      if (res.data.passed) {
        notify.success('Assessment Passed', res.data.feedback)
        setLevel((prev) =>
          prev
            ? {
                ...prev,
                user_progress: {
                  ...prev.user_progress,
                  problem_solving_score: res.data.score,
                  status: 'completed',
                },
              }
            : null
        )
      } else {
        notify.error('Assessment Incomplete', res.data.feedback)
      }
    } catch (e) {
      notify.error('Submission Error', 'Failed to submit answers.')
    }
  }

  const trackTitle =
    level.track === 'beginner'
      ? 'Beginner Track'
      : level.track === 'intermediate'
      ? 'Intermediate Track'
      : level.track === 'advanced'
      ? 'Advanced Track'
      : 'Expert Track'

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-bg-base">
      {/* 1. Level Workspace Slim Top Header */}
      <div className="bg-bg-panel border-b border-border-base px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-14 z-30">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            to="/levels"
            className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Curriculum</span>
          </Link>
          <span className="text-border-base">/</span>
          <span className="text-text-muted hidden sm:inline">{trackTitle}</span>
          <span className="text-border-base hidden sm:inline">/</span>
          <span className="text-text-primary font-semibold truncate max-w-[200px] md:max-w-none">
            Level {level.level_id.toString().padStart(3, '0')}: {level.title}
          </span>
        </div>

        {/* Level Navigation and Progress */}
        <div className="flex items-center gap-3">
          {/* Level Step Progress Bar */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-text-muted">
            <span>Checkpoints:</span>
            <div className="w-24">
              <ProgressBar value={stepProgress.completed} max={stepProgress.total} color="teal" />
            </div>
            <span className="font-semibold text-text-primary">
              {stepProgress.completed}/{stepProgress.total}
            </span>
          </div>

          {/* Prev / Next Level Controls */}
          <div className="flex items-center gap-1">
            {levelId > 1 && (
              <button
                type="button"
                onClick={() => navigate(`/levels/${levelId - 1}`)}
                className="px-2 py-1 bg-bg-base hover:bg-bg-panel-subtle text-text-muted hover:text-text-primary border border-border-base rounded text-xs font-mono transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
                title={`Previous: Level ${levelId - 1}`}
              >
                ← Prev
              </button>
            )}

            {levelId < 100 && (
              <button
                type="button"
                onClick={() => navigate(`/levels/${levelId + 1}`)}
                className="px-2 py-1 bg-bg-base hover:bg-bg-panel-subtle text-accent-teal hover:text-accent-teal border border-border-base rounded text-xs font-mono transition-colors flex items-center gap-0.5 focus-visible:ring-1 focus-visible:ring-accent-amber"
                title={`Next: Level ${levelId + 1}`}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile Tab Switcher */}
      <div className="lg:hidden bg-bg-panel-subtle border-b border-border-base p-1.5 flex gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('writeup')}
          className={`flex-1 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
            mobileTab === 'writeup'
              ? 'bg-bg-panel text-text-primary border border-border-base'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Task Write-up
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('console')}
          className={`flex-1 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
            mobileTab === 'console'
              ? 'bg-bg-panel text-text-primary border border-border-base'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Lab Console
        </button>
      </div>

      {/* 3. Two-Pane Split-Pane Main Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT PANE: Task Write-up (Scrollable) */}
        <div
          className={`lg:col-span-6 xl:col-span-7 p-4 md:p-6 lg:border-r border-border-base overflow-y-auto ${
            mobileTab === 'writeup' ? 'block' : 'hidden lg:block'
          }`}
        >
          <TheoryPanel
            level={level}
            onComplete={handleTheoryComplete}
            onStepProgressChange={(completed, total) => setStepProgress({ completed, total })}
          />
        </div>

        {/* RIGHT PANE: Interactive Lab Console & Assessments */}
        <div
          className={`lg:col-span-6 xl:col-span-5 p-4 md:p-6 bg-bg-base overflow-y-auto ${
            mobileTab === 'console' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Console Mode Tab Strip */}
          <div className="flex items-center gap-1.5 border-b border-border-base pb-3 mb-4 text-xs font-mono">
            <button
              type="button"
              onClick={() => setConsoleTab('lab')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                consoleTab === 'lab'
                  ? 'bg-bg-panel text-accent-teal border border-border-base font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Lab Sandbox</span>
              {level.user_progress?.lab_completed && (
                <CheckCircle2 className="w-3 h-3 text-accent-teal ml-0.5" />
              )}
            </button>

            {level.problem_solving && (
              <button
                type="button"
                onClick={() => setConsoleTab('problems')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  consoleTab === 'problems'
                    ? 'bg-bg-panel text-accent-teal border border-border-base font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Assessment</span>
                {level.user_progress?.problem_solving_score >= 70 && (
                  <CheckCircle2 className="w-3 h-3 text-accent-teal ml-0.5" />
                )}
              </button>
            )}

            {level.forensics?.enabled && (
              <button
                type="button"
                onClick={() => setConsoleTab('forensics')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  consoleTab === 'forensics'
                    ? 'bg-bg-panel text-accent-danger border border-border-base font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Forensics</span>
                {level.user_progress?.forensics_completed && (
                  <CheckCircle2 className="w-3 h-3 text-accent-teal ml-0.5" />
                )}
              </button>
            )}
          </div>

          {/* Console Content based on selected tab */}
          {consoleTab === 'lab' && (
            <LabPanel
              level={level}
              levelId={levelId}
              onComplete={handleLabComplete}
            />
          )}

          {consoleTab === 'problems' && level.problem_solving && (
            <ProblemSolver
              questions={level.problem_solving.questions}
              onSubmit={handleProblemSubmit}
              lastScore={level.user_progress?.problem_solving_score}
            />
          )}

          {consoleTab === 'forensics' && level.forensics?.enabled && (
            <ForensicsViewer
              level={level}
              levelId={levelId}
              onComplete={() => {
                setLevel((prev) =>
                  prev
                    ? {
                        ...prev,
                        user_progress: { ...prev.user_progress, forensics_completed: true },
                      }
                    : null
                )
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default LevelDetail
