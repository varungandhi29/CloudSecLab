import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Award, CheckCircle2, Lock, Filter, BookOpen } from 'lucide-react'
import { api } from '../services/api'
import { LevelSummary, ExamSummary } from '../types'
import { LevelCard } from '../components/ui/LevelCard'
import { ProgressBar } from '../components/ui/ProgressBar'

export const LevelMap: React.FC = () => {
  const [levels, setLevels] = useState<LevelSummary[]>([])
  const [exams, setExams] = useState<ExamSummary[]>([])
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/levels')
        setLevels(res.data)

        const examRes = await api.get('/exams')
        setExams(examRes.data)
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter levels based on search, track, provider, category
  const filteredLevels = levels.filter((lvl) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      lvl.title.toLowerCase().includes(q) ||
      `level ${lvl.level_id}`.includes(q) ||
      `l${lvl.level_id}`.includes(q) ||
      (lvl.category && lvl.category.toLowerCase().includes(q))

    const matchesTrack = trackFilter === 'all' || lvl.track === trackFilter
    const matchesProvider =
      providerFilter === 'all' || (lvl.cloud_platform || 'aws').toLowerCase() === providerFilter.toLowerCase()
    const matchesCategory =
      categoryFilter === 'all' || (lvl.category || '').toLowerCase().includes(categoryFilter.toLowerCase())

    return matchesSearch && matchesTrack && matchesProvider && matchesCategory
  })

  const getTrackLevels = (trackName: string) => filteredLevels.filter((l) => l.track === trackName)

  const examMap: Record<string, ExamSummary> = {}
  exams.forEach((e) => {
    examMap[e.track] = e
  })

  const totalCompleted = levels.filter((l) => l.status === 'completed').length

  const tracks = [
    { name: 'beginner', title: 'Beginner Track', range: 'Levels 1 – 25', examKey: 'beginner' },
    { name: 'intermediate', title: 'Intermediate Track', range: 'Levels 26 – 50', examKey: 'intermediate' },
    { name: 'advanced', title: 'Advanced Track', range: 'Levels 51 – 75', examKey: 'advanced' },
    { name: 'expert', title: 'Expert CTF Track', range: 'Levels 76 – 100', examKey: 'expert' },
  ]

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'iam', label: 'Identity & IAM' },
    { id: 'storage', label: 'Storage & S3' },
    { id: 'network', label: 'Networking & VPC' },
    { id: 'logging', label: 'Audit & CloudTrail' },
    { id: 'encrypt', label: 'KMS & Encryption' },
    { id: 'forensic', label: 'Forensics' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header & Overall Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-base pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            Cloud Security Curriculum
          </h1>
          <p className="text-text-muted text-xs md:text-sm mt-0.5">
            100 hands-on labs across AWS, Azure, and GCP. Complete tracks to unlock module certification exams.
          </p>
        </div>

        {/* Global Progress Indicator */}
        <div className="bg-bg-panel border border-border-base px-4 py-2.5 rounded-lg flex items-center gap-4 shrink-0">
          <div className="text-right font-mono">
            <div className="text-xs text-text-muted">Total Progress</div>
            <div className="text-sm font-bold text-text-primary">
              <span className="text-accent-teal">{totalCompleted}</span> / 100 Labs
            </div>
          </div>
          <div className="w-24">
            <ProgressBar value={totalCompleted} max={100} color="teal" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="space-y-3 bg-bg-panel-subtle border border-border-base p-3.5 rounded-lg">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by topic, service (e.g. IAM, S3, VPC), or level number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-input border border-border-base rounded-md pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/60 focus-visible:ring-2 focus-visible:ring-accent-amber font-mono"
            />
          </div>

          {/* Provider & Track Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Provider Filter */}
            <div className="flex bg-bg-input border border-border-base rounded-md p-0.5">
              {[
                { id: 'all', label: 'All Cloud' },
                { id: 'aws', label: 'AWS' },
                { id: 'azure', label: 'Azure' },
                { id: 'gcp', label: 'GCP' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProviderFilter(p.id)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                    providerFilter === p.id
                      ? 'bg-bg-panel text-text-primary font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Track Filter Select */}
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-bg-input border border-border-base rounded-md px-3 py-1.5 text-xs text-text-primary focus-visible:ring-2 focus-visible:ring-accent-amber font-mono"
            >
              <option value="all">All Difficulty Tracks</option>
              <option value="beginner">Beginner (1–25)</option>
              <option value="intermediate">Intermediate (26–50)</option>
              <option value="advanced">Advanced (51–75)</option>
              <option value="expert">Expert CTF (76–100)</option>
            </select>
          </div>
        </div>

        {/* Topic Tag Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border-subtle">
          <span className="text-[10px] font-mono uppercase text-text-muted mr-1">Topics:</span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                categoryFilter === c.id
                  ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/40 font-medium'
                  : 'bg-bg-input text-text-muted hover:text-text-primary border border-border-subtle'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bg-panel border border-border-base p-4 rounded-lg space-y-3 animate-pulse">
              <div className="h-4 bg-bg-panel-subtle rounded w-3/4" />
              <div className="h-24 bg-bg-panel-subtle rounded" />
              <div className="h-24 bg-bg-panel-subtle rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLevels.length === 0 && (
        <div className="bg-bg-panel border border-border-base rounded-lg p-10 text-center space-y-3 max-w-lg mx-auto my-12">
          <BookOpen className="w-8 h-8 text-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-text-primary">No labs match your filters</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Try clearing your search query or selecting "All Topics" to find available cloud security levels.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setTrackFilter('all')
              setProviderFilter('all')
              setCategoryFilter('all')
            }}
            className="px-3 py-1.5 bg-bg-base hover:bg-bg-input border border-border-base rounded-md text-xs font-mono text-accent-teal transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 4 Tracks Column Grid */}
      {!loading && filteredLevels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {tracks.map((track) => {
            const trackLvls = getTrackLevels(track.name)
            if (trackFilter !== 'all' && trackFilter !== track.name) return null

            const exam = examMap[track.name]
            const trackCompleted = trackLvls.filter((l) => l.status === 'completed').length

            return (
              <div key={track.name} className="space-y-3 bg-bg-base">
                {/* Track Sticky Header */}
                <div className="bg-bg-panel border border-border-base p-3 rounded-lg sticky top-16 z-20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-text-primary font-mono">{track.title}</h3>
                    <span className="text-[10px] font-mono text-text-muted">
                      {trackCompleted}/{trackLvls.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-text-muted mt-1">
                    <span>{track.range}</span>
                    <span className="text-accent-teal">
                      {trackLvls.length > 0 ? Math.round((trackCompleted / trackLvls.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar
                      value={trackCompleted}
                      max={trackLvls.length || 1}
                      color={trackCompleted === trackLvls.length && trackLvls.length > 0 ? 'teal' : 'amber'}
                    />
                  </div>
                </div>

                {/* Level Cards List */}
                <div className="space-y-2.5">
                  {trackLvls.map((lvl) => (
                    <div key={lvl.level_id} className="min-h-[105px]">
                      <LevelCard level={lvl} />
                    </div>
                  ))}

                  {/* Module Exam Card at bottom of track */}
                  {exam && (
                    <div className="pt-2">
                      <Link
                        to={exam.is_unlocked ? `/exam/${exam.exam_id}` : '#'}
                        className={`block p-3.5 rounded-lg border transition-all ${
                          exam.passed
                            ? 'bg-bg-panel border-accent-teal/40 text-text-primary'
                            : exam.is_unlocked
                            ? 'bg-bg-panel border-accent-amber/50 text-text-primary hover:border-accent-amber'
                            : 'bg-bg-panel/40 border-border-subtle text-text-muted cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-accent-amber">
                            <Award className="w-4 h-4" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                              Module Exam
                            </span>
                          </div>
                          {exam.passed ? (
                            <span className="text-[10px] font-mono font-bold text-accent-teal bg-accent-teal/10 border border-accent-teal/30 px-1.5 py-0.5 rounded">
                              PASSED ✓
                            </span>
                          ) : exam.is_unlocked ? (
                            <span className="text-[10px] font-mono font-bold text-accent-amber bg-accent-amber/10 border border-accent-amber/30 px-1.5 py-0.5 rounded">
                              READY
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Lvl {exam.unlocks_after_level}
                            </span>
                          )}
                        </div>

                        <h4 className="font-semibold text-xs text-text-primary leading-snug">
                          {exam.title}
                        </h4>
                        <p className="text-[11px] font-mono text-text-muted mt-1">
                          {exam.passed
                            ? 'Certificate Earned'
                            : exam.is_unlocked
                            ? 'Unlocked — Take Certification Exam'
                            : `Complete all ${track.title} levels to unlock`}
                        </p>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LevelMap
