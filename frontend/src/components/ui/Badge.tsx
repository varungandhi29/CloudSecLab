import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'teal' | 'amber' | 'danger' | 'subtle' | 'aws' | 'azure' | 'gcp' | 'cyan' | 'gold' | 'green' | 'red' | 'gray'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'subtle', className = '' }) => {
  const styles: Record<string, string> = {
    teal: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
    green: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
    cyan: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
    amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    gold: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
    danger: 'bg-accent-danger/10 text-accent-danger border-accent-danger/30',
    red: 'bg-accent-danger/10 text-accent-danger border-accent-danger/30',
    subtle: 'bg-bg-panel text-text-muted border-border-base',
    gray: 'bg-bg-panel text-text-muted border-border-base',
    aws: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30',
    azure: 'bg-[#4E9BE0]/10 text-[#4E9BE0] border-[#4E9BE0]/30',
    gcp: 'bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/30',
  }

  const selectedStyle = styles[variant] || styles.subtle

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${selectedStyle} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
