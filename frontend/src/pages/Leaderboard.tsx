import React, { useEffect, useState } from 'react'
import { Trophy, Search, Zap, Flame, Award } from 'lucide-react'
import { api } from '../services/api'
import { LeaderboardEntry } from '../types'
import { useAuthStore } from '../store/authStore'
import { LeaderboardChart } from '../components/charts/LeaderboardChart'

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [search, setSearch] = useState('')
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard')
        setEntries(res.data)
      } catch (e) {}
    }
    fetchLeaderboard()
  }, [])

  const filtered = entries.filter((e) => e.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            <Trophy className="w-8 h-8 text-amber-400 mr-3" />
            Global Leaderboard
          </h1>
          <p className="text-gray-400 text-sm">Top cloud security practitioners ranked by Total XP and completed challenges.</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono w-64"
          />
        </div>
      </div>

      {/* Top 10 Chart */}
      {entries.length > 0 && (
        <div className="bg-card border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-300 font-mono">TOP OPERATORS XP DISTRIBUTION</h3>
          <LeaderboardChart data={entries} />
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-gray-900 text-cyan-400 uppercase text-xs border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4 text-right">Levels</th>
                <th className="px-6 py-4 text-right">Certs</th>
                <th className="px-6 py-4 text-right">Streak</th>
                <th className="px-6 py-4 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((entry) => {
                const isMe = user?.username === entry.username
                return (
                  <tr
                    key={entry.username}
                    className={`transition-colors ${
                      isMe ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400 font-bold' : 'hover:bg-gray-900/40'
                    }`}
                  >
                    <td className="px-6 py-4">
                      {entry.rank === 1 ? (
                        <span className="text-amber-400 font-extrabold flex items-center">🥇 #1</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-gray-300 font-extrabold flex items-center">🥈 #2</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-amber-600 font-extrabold flex items-center">🥉 #3</span>
                      ) : (
                        <span className="text-gray-400">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-100 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-cyan-400">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold">{entry.username}</div>
                        <div className="text-xs text-gray-500 font-sans">{entry.full_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{entry.country || 'US'}</td>
                    <td className="px-6 py-4 text-right text-emerald-400">{entry.completed_levels}</td>
                    <td className="px-6 py-4 text-right text-amber-400">{entry.certificates_count}</td>
                    <td className="px-6 py-4 text-right text-amber-500">{entry.streak_days}d</td>
                    <td className="px-6 py-4 text-right font-extrabold text-cyan-400">
                      {entry.total_xp.toLocaleString()} XP
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default Leaderboard
