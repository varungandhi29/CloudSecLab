import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'cyan' | 'green' | 'gold' | 'red' | 'gray'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'cyan', className = '' }) => {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    gray: 'bg-gray-800 text-gray-400 border-gray-700',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
