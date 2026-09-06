import React, { useState } from 'react'
import { User as UserIcon, Shield, Edit3, Save, Zap, Flame, Award, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { XPBar } from '../components/ui/XPBar'

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [country, setCountry] = useState(user?.country || 'US')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/users/profile', {
        full_name: fullName,
        country,
        bio,
      })
      setUser({ ...user, ...res.data })
      setEditing(false)
    } catch (e) {
      alert('Error updating profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Banner */}
      <div className="bg-card border border-gray-800 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center font-bold text-3xl text-cyan-400 font-mono">
            {user.username.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white">{user.full_name}</h1>
              <span className="font-mono text-xs bg-gray-800 text-cyan-400 px-3 py-1 rounded-full border border-gray-700">
                @{user.username}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-mono">{user.email} • {user.country || 'US'}</p>
            <p className="text-xs text-gray-300 italic pt-1">{user.bio || 'Cloud Security Researcher'}</p>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold rounded-xl border border-gray-700 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-card border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Edit Profile Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">COUNTRY</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1">BIO</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl text-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      )}

      {/* Level XP Bar */}
      <XPBar totalXp={user.total_xp} level={user.current_level} />

      {/* Activity Heatmap Representation */}
      <div className="bg-card border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-200 font-mono">ACTIVITY & COMPLETON LOG</h3>
        <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
          {Array.from({ length: 28 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-8 rounded-lg border border-gray-800 flex items-center justify-center text-[10px] font-mono ${
                idx < (user.current_level % 28)
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'bg-gray-950/40 text-gray-700'
              }`}
            >
              D{idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Profile
