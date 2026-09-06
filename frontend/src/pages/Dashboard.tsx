import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Award, Zap, Trophy, Flame, CheckCircle, BookOpen, ArrowRight } from 'lucide-react'
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-card to-card border border-cyan-500/30 rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-white">Welcome back, {user.full_name}!</h1>
            <span className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user.streak_days} Day Streak</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Continue your journey. You are currently on <strong className="text-cyan-400">Level {currentLevelId}</strong>.
          </p>
        </div>

        <Link
          to={`/levels/${currentLevelId}`}
          className="z-10 flex items-center space-x-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all shrink-0"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>Resume Level {currentLevelId}</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-gray-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono font-semibold uppercase">Levels Completed</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats.completed_levels} <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono font-semibold uppercase">Total XP</span>
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {user.total_xp.toLocaleString()}
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono font-semibold uppercase">Leaderboard Rank</span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            #{myRank}
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-mono font-semibold uppercase">Certificates Earned</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {certificates.length} <span className="text-xs text-gray-500">/ 4</span>
          </div>
        </div>
      </div>

      {/* XP Level Progress */}
      <XPBar totalXp={user.total_xp} level={user.current_level} />

      {/* Upcoming Exam Card */}
      {nextExam && (
        <div className="bg-gray-900/80 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">UPCOMING MODULE EXAM</span>
            <h3 className="text-xl font-bold text-white">{nextExam.title}</h3>
            <p className="text-xs text-gray-400">
              Requires level {nextExam.unlocks_after_level} completion. Duration: {nextExam.duration_minutes} mins.
            </p>
          </div>

          <Link
            to={nextExam.is_unlocked ? `/exam/${nextExam.exam_id}` : '/levels'}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              nextExam.is_unlocked
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {nextExam.is_unlocked ? 'Take Exam Now' : `Unlocks at Lvl ${nextExam.unlocks_after_level}`}
          </Link>
        </div>
      )}

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Award className="w-5 h-5 text-amber-400 mr-2" />
            Your Earned Certificates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
