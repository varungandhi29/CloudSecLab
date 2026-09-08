import React, { useState } from 'react'
import { Edit3, Save, User as UserIcon, Shield, Flame, Zap, Award } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { XPBar } from '../components/ui/XPBar'
import { notify } from '../store/toastStore'

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
      notify.success('Profile Updated', 'Your profile details have been saved.')
    } catch (e) {
      notify.error('Update Failed', 'Unable to update profile details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-6 py-6 text-text-primary text-xs">
      {/* Profile Header Banner */}
      <div className="bg-bg-panel border border-border-base rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-bg-base border border-border-base flex items-center justify-center font-mono font-bold text-xl text-accent-teal">
            {user.username.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono">
              <h1 className="text-lg font-bold text-text-primary">{user.full_name || user.username}</h1>
              <span className="text-[11px] bg-bg-base border border-border-base text-accent-teal px-2 py-0.5 rounded">
                @{user.username}
              </span>
            </div>
            <p className="text-text-muted font-mono text-[11px]">
              {user.email} • {user.country || 'US'}
            </p>
            <p className="text-[#C8D1DC] text-xs font-sans italic m-0 pt-0.5">
              {user.bio || 'Cloud Security Practitioner'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-base hover:bg-bg-panel-subtle text-text-muted hover:text-text-primary text-xs font-mono font-medium rounded border border-border-base transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-bg-panel border border-border-base rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
            Edit Profile Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div>
              <label className="text-[11px] text-text-muted block mb-1">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
              />
            </div>
            <div>
              <label className="text-[11px] text-text-muted block mb-1">COUNTRY CODE</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary focus-visible:ring-1 focus-visible:ring-accent-amber"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-text-muted block mb-1">BIO / ROLE</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-bg-input border border-border-base rounded px-3 py-2 text-xs text-text-primary font-mono focus-visible:ring-1 focus-visible:ring-accent-amber"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-mono font-bold rounded text-xs transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* XP Level Bar */}
      <XPBar totalXp={user.total_xp} level={user.current_level} />

      {/* Activity Heatmap Grid */}
      <div className="bg-bg-panel border border-border-base rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
          Curriculum Activity Matrix (Recent 28 Days)
        </h3>
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
          {Array.from({ length: 28 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-7 rounded border flex items-center justify-center text-[10px] font-mono ${
                idx < (user.current_level % 28)
                  ? 'bg-accent-teal/20 border-accent-teal/50 text-accent-teal font-bold'
                  : 'bg-bg-base border-border-subtle text-text-muted/40'
              }`}
              title={`Day ${idx + 1}`}
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
