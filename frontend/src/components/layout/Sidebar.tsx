import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, Award, Trophy, User, ShieldAlert } from 'lucide-react'

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/levels', label: 'Level Map', icon: Map },
    { to: '/certificates', label: 'Certificates', icon: Award },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <aside className="w-64 bg-surface border-r border-gray-800 min-h-[calc(100vh-4rem)] p-4 space-y-6 shrink-0">
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-card/60'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-800">
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>LAB STATUS</span>
          </div>
          <p className="text-xs text-gray-400">LocalStack AWS Sandbox Active</p>
          <div className="flex items-center space-x-2 pt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Engine Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
