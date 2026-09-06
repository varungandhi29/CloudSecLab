import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Award, Lock, CheckCircle, Play, Shield } from 'lucide-react'
import { api } from '../services/api'
import { LevelSummary, ExamSummary } from '../types'
import { LevelCard } from '../components/ui/LevelCard'

export const LevelMap: React.FC = () => {
  const [levels, setLevels] = useState<LevelSummary[]>([])
  const [exams, setExams] = useState<ExamSummary[]>([])
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState<string>('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/levels')
        setLevels(res.data)

        const examRes = await api.get('/exams')
        setExams(examRes.data)
      } catch (e) {}
    }
    loadData()
  }, [])

  const filteredLevels = levels.filter((lvl) => {
    const matchesSearch = lvl.title.toLowerCase().includes(search.toLowerCase())
    const matchesTrack = trackFilter === 'all' || lvl.track === trackFilter
    return matchesSearch && matchesTrack
  })

  const getTrackLevels = (trackName: string) =>
    filteredLevels.filter((l) => l.track === trackName)

  const examMap: Record<string, ExamSummary> = {}
  exams.forEach((e) => {
    examMap[e.track] = e
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cloud Security Level Map</h1>
          <p className="text-gray-400 text-sm">100 levels across 4 skill tracks. Complete levels to unlock module final exams.</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search levels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono w-64"
            />
          </div>

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="bg-card border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Tracks</option>
            <option value="beginner">Beginner (1-25)</option>
            <option value="intermediate">Intermediate (26-50)</option>
            <option value="advanced">Advanced (51-75)</option>
            <option value="expert">Expert (76-100)</option>
          </select>
        </div>
      </div>

      {/* 4 Tracks Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'beginner', title: 'Beginner Track', range: 'Levels 1 - 25', examKey: 'beginner' },
          { name: 'intermediate', title: 'Intermediate Track', range: 'Levels 26 - 50', examKey: 'intermediate' },
          { name: 'advanced', title: 'Advanced Track', range: 'Levels 51 - 75', examKey: 'advanced' },
          { name: 'expert', title: 'Expert Track', range: 'Levels 76 - 100', examKey: 'expert' },
        ].map((track) => {
          const trackLvls = getTrackLevels(track.name)
          const exam = examMap[track.name]

          return (
            <div key={track.name} className="space-y-4">
              <div className="bg-card/80 border border-gray-800 p-4 rounded-xl sticky top-20 z-10 backdrop-blur-md">
                <h3 className="font-bold text-gray-100 capitalize">{track.title}</h3>
                <p className="text-xs font-mono text-cyan-400">{track.range}</p>
              </div>

              <div className="space-y-3">
                {trackLvls.map((lvl) => (
                  <div key={lvl.level_id} className="h-28">
                    <LevelCard level={lvl} />
                  </div>
                ))}

                {/* Exam Card at bottom of track */}
                {exam && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <Link
                      to={exam.is_unlocked ? `/exam/${exam.exam_id}` : '#'}
                      className={`block p-4 rounded-xl border transition-all ${
                        exam.passed
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                          : exam.is_unlocked
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-gray-900/40 border-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          MODULE EXAM
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-100">{exam.title}</h4>
                      <p className="text-xs font-mono text-gray-400 mt-1">
                        {exam.passed ? 'PASSED ✓' : exam.is_unlocked ? 'UNLOCKED - Take Exam' : `Requires Lvl ${exam.unlocks_after_level}`}
                      </p>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default LevelMap
