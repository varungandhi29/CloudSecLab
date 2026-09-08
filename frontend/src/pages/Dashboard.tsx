import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Award, Zap, Trophy, Flame, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { XPBar } from '../components/ui/XPBar'
import { CertificateCard } from '../components/ui/CertificateCard'
import { CertificateItem, ExamSummary } from '../types'

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ completed_levels: 0, total_levels: 100, completion_percentage: 0 })
  const [myRank, setMyRank] = useState(1)
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [exams, setExams] = useState<ExamSummary[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/progress/stats')
        setStats(statsRes.data)

        const rankRes = await api.get('/leaderboard/me')
        setMyRank(rankRes.data.rank)

        const certRes = await api.get('/certificates')
        setCertificates(certRes.data)

        const examRes = await api.get('/exams')
        setExams(examRes.data)
      } catch (e) {}
    }
    fetchData()
  }, [])

  if (!user) return null

  const currentLevelId = user.current_level || 1
  const nextExam = exams.find((e) => !e.passed) || exams[0]

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-6 py-6 text-text-primary text-xs">
      {/* 1. Welcome & Quick Resume Banner */}
      <div className="bg-bg-panel border border-border-base rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-mono tracking-tight">
              Welcome back, {user.full_name || user.username}
            </h1>
            <span className="flex items-center gap-1 bg-accent-amber/10 border border-accent-amber/30 text-accent-amber px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
              <Flame className="w-3 h-3 fill-accent-amber" />
              <span>{user.streak_days}d streak</span>
            </span>
          </div>
          <p className="text-text-muted text-xs font-sans m-0">
            You are currently on <strong className="text-text-primary font-mono">Level {currentLevelId}</strong>. Ready to resume practice?
          </p>
        </div>

        <Link
          to={`/levels/${currentLevelId}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-mono font-bold rounded text-xs transition-colors shrink-0 focus-visible:ring-1 focus-visible:ring-accent-amber"
        >
          <Play className="w-3.5 h-3.5 fill-bg-base" />
          <span>Resume Level {currentLevelId}</span>
        </Link>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono">
        <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-1">
          <div className="text-[11px] text-text-muted uppercase">Completed Labs</div>
          <div className="text-xl sm:text-2xl font-bold text-text-primary">
            {stats.completed_levels} <span className="text-xs text-text-muted">/ 100</span>
          </div>
        </div>

        <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-1">
          <div className="text-[11px] text-text-muted uppercase">Total XP</div>
          <div className="text-xl sm:text-2xl font-bold text-accent-amber">
            {user.total_xp.toLocaleString()}
          </div>
        </div>

        <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-1">
          <div className="text-[11px] text-text-muted uppercase">Leaderboard Rank</div>
          <div className="text-xl sm:text-2xl font-bold text-accent-teal">
            #{myRank}
          </div>
        </div>

        <div className="bg-bg-panel border border-border-base rounded-lg p-4 space-y-1">
          <div className="text-[11px] text-text-muted uppercase">Certificates</div>
          <div className="text-xl sm:text-2xl font-bold text-text-primary">
            {certificates.length} <span className="text-xs text-text-muted">/ 4</span>
          </div>
        </div>
      </div>

      {/* 3. XP Level Bar */}
      <XPBar totalXp={user.total_xp} level={user.current_level} />

      {/* 4. Upcoming Exam Banner */}
      {nextExam && (
        <div className="bg-bg-panel border border-border-base rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-accent-amber uppercase tracking-wider">
              Track Milestone Exam
            </span>
            <h3 className="text-sm font-bold text-text-primary font-mono">{nextExam.title}</h3>
            <p className="text-xs text-text-muted font-sans m-0">
              Requires completing all levels up to Level {nextExam.unlocks_after_level}. Exam duration: {nextExam.duration_minutes} minutes.
            </p>
          </div>

          <Link
            to={nextExam.is_unlocked ? `/exam/${nextExam.exam_id}` : '/levels'}
            className={`px-4 py-2 rounded text-xs font-mono font-semibold transition-colors shrink-0 ${
              nextExam.is_unlocked
                ? 'bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/40'
                : 'bg-bg-base border border-border-base text-text-muted cursor-not-allowed opacity-60'
            }`}
          >
            {nextExam.is_unlocked ? 'Take Certification Exam' : `Unlocks at Level ${nextExam.unlocks_after_level}`}
          </Link>
        </div>
      )}

      {/* 5. Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-teal" />
              <span>Earned Credentials</span>
            </h2>
            <Link to="/certificates" className="text-xs font-mono text-accent-teal hover:underline">
              View all certificates →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
