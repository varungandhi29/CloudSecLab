import React, { useEffect, useState } from 'react'
import { Trophy, Search } from 'lucide-react'
import { api } from '../services/api'
import { LeaderboardEntry } from '../types'
import { useAuthStore } from '../store/authStore'
import { LeaderboardChart } from '../components/charts/LeaderboardChart'

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard')
        setEntries(res.data)
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const filtered = entries.filter((e) =>
    e.username.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-6 py-6 text-text-primary text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-base pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary font-mono tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-amber" />
            <span>Global Operator Leaderboard</span>
          </h1>
          <p className="text-text-muted text-xs font-sans mt-0.5">
            Cloud security engineers ranked by total XP, level completions, and earned credentials.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 bg-bg-input border border-border-base rounded pl-8 pr-3 py-1.5 text-xs text-text-primary font-mono focus-visible:ring-1 focus-visible:ring-accent-amber"
          />
        </div>
      </div>

      {/* Top 10 Recharts Distribution */}
      {!loading && entries.length > 0 && (
        <div className="bg-bg-panel border border-border-base rounded-xl p-5 space-y-2">
          <h3 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
            Top Operators XP Distribution
          </h3>
          <LeaderboardChart data={entries} />
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-bg-panel border border-border-base rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-bg-panel-subtle text-text-muted uppercase text-[10px] border-b border-border-base font-semibold">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3 text-right">Labs</th>
                <th className="px-4 py-3 text-right">Certs</th>
                <th className="px-4 py-3 text-right">Streak</th>
                <th className="px-4 py-3 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((entry) => {
                const isMe = user?.username === entry.username

                return (
                  <tr
                    key={entry.username}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-accent-teal/10 font-semibold'
                        : 'hover:bg-bg-panel-subtle/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      {entry.rank === 1 ? (
                        <span className="text-accent-amber font-bold">🥇 #1</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-text-primary font-bold">🥈 #2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-accent-amber font-bold">🥉 #3</span>
                      ) : (
                        <span className="text-text-muted">#{entry.rank}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-text-primary flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-bg-base border border-border-base flex items-center justify-center font-bold text-[10px] text-accent-teal">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold leading-tight">{entry.username}</div>
                        {entry.full_name && (
                          <div className="text-[10px] text-text-muted font-sans">{entry.full_name}</div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-text-muted">{entry.country || 'US'}</td>
                    <td className="px-4 py-3 text-right text-accent-teal">{entry.completed_levels}</td>
                    <td className="px-4 py-3 text-right text-text-primary">{entry.certificates_count}</td>
                    <td className="px-4 py-3 text-right text-accent-amber">{entry.streak_days}d</td>
                    <td className="px-4 py-3 text-right font-bold text-accent-amber">
                      {entry.total_xp.toLocaleString()} XP
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted font-mono text-xs">
                    No operators match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
