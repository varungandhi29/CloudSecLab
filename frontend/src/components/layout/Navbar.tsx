import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Zap, Award, User as UserIcon, LogOut, Flame } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="h-16 bg-surface/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center space-x-3">
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-lg text-gray-100 tracking-wider">
            CLOUD<span className="text-cyan-400">SEC</span>LAB
          </span>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            Cloud Security Platform
          </span>
        </div>
      </Link>

      {/* User Stats & Profile Pill */}
      {user && (
        <div className="flex items-center space-x-6">
          {/* Streak */}
          <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-amber-400 font-semibold">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{user.streak_days} DAY STREAK</span>
          </div>

          {/* XP Pill */}
          <div className="flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-400 font-semibold">
            <Zap className="w-4 h-4 fill-cyan-400" />
            <span>{user.total_xp.toLocaleString()} XP</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-800">
            <Link to="/profile" className="flex items-center space-x-2 text-gray-200 hover:text-cyan-400 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-semibold">{user.username}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
