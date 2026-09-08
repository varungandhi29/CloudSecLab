import React from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Shield, Zap, Flame, LogOut, User, Award, Map, Trophy, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Check if we are inside a specific level
  const levelMatch = location.pathname.match(/^\/levels\/(\d+)$/)
  const currentLevelId = levelMatch ? levelMatch[1] : null

  return (
    <header className="h-14 bg-bg-panel border-b border-border-base sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Left Navigation */}
      <div className="flex items-center space-x-6">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2.5 text-text-primary hover:text-accent-teal transition-colors rounded focus-visible:ring-2 focus-visible:ring-accent-amber"
          aria-label="CloudSecLab Home"
        >
          <div className="w-7 h-7 rounded-md bg-bg-base border border-border-base flex items-center justify-center text-accent-teal">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-mono font-semibold text-sm tracking-tight text-text-primary">
            CloudSec<span className="text-accent-teal">Lab</span>
          </span>
        </Link>

        {/* Breadcrumb or Main Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 text-xs">
          <NavLink
            to="/levels"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition-colors ${
                isActive
                  ? 'text-text-primary bg-bg-base border border-border-base'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-base/50'
              }`
            }
          >
            Curriculum
          </NavLink>

          <NavLink
            to="/certificates"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition-colors ${
                isActive
                  ? 'text-text-primary bg-bg-base border border-border-base'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-base/50'
              }`
            }
          >
            Certificates
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition-colors ${
                isActive
                  ? 'text-text-primary bg-bg-base border border-border-base'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-base/50'
              }`
            }
          >
            Leaderboard
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition-colors ${
                isActive
                  ? 'text-text-primary bg-bg-base border border-border-base'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-base/50'
              }`
            }
          >
            Dashboard
          </NavLink>
        </nav>
      </div>

      {/* User Stats & Profile Actions */}
      {user && (
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Active Streak */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-bg-base border border-border-base text-xs font-mono text-accent-amber"
            title={`${user.streak_days} day practice streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-accent-amber" />
            <span className="font-semibold">{user.streak_days}d</span>
          </div>

          {/* XP Pill */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-bg-base border border-border-base text-xs font-mono text-text-primary"
            title={`${user.total_xp} Total XP earned`}
          >
            <Zap className="w-3.5 h-3.5 text-accent-amber fill-accent-amber" />
            <span className="font-semibold text-text-primary">{user.total_xp.toLocaleString()} XP</span>
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-border-base">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-text-muted hover:text-text-primary transition-colors p-1 rounded focus-visible:ring-2 focus-visible:ring-accent-amber"
              title="View Profile"
            >
              <div className="w-6 h-6 rounded bg-bg-base border border-border-base flex items-center justify-center font-mono text-[11px] font-bold text-accent-teal">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{user.username}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-accent-danger hover:bg-bg-base rounded transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
