import React from 'react'
import { Info, AlertTriangle, AlertOctagon, Lightbulb, ShieldCheck } from 'lucide-react'

export type CalloutType = 'info' | 'note' | 'warning' | 'danger' | 'tip' | 'insight'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
  className?: string
}

export const Callout: React.FC<CalloutProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const configs: Record<
    CalloutType,
    { border: string; bg: string; text: string; icon: React.ReactNode; defaultTitle: string }
  > = {
    info: {
      border: 'border-l-accent-teal border-border-base',
      bg: 'bg-bg-panel-subtle',
      text: 'text-accent-teal',
      icon: <Info className="w-4 h-4 text-accent-teal shrink-0" />,
      defaultTitle: 'Note',
    },
    note: {
      border: 'border-l-text-muted border-border-base',
      bg: 'bg-bg-panel-subtle',
      text: 'text-text-muted',
      icon: <Info className="w-4 h-4 text-text-muted shrink-0" />,
      defaultTitle: 'Note',
    },
    warning: {
      border: 'border-l-accent-amber border-border-base',
      bg: 'bg-bg-panel-subtle',
      text: 'text-accent-amber',
      icon: <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0" />,
      defaultTitle: 'Real-World Incident',
    },
    danger: {
      border: 'border-l-accent-danger border-border-base',
      bg: 'bg-bg-panel-subtle',
      text: 'text-accent-danger',
      icon: <AlertOctagon className="w-4 h-4 text-accent-danger shrink-0" />,
      defaultTitle: 'Security Risk',
    },
    tip: {
      border: 'border-l-accent-teal border-border-base',
      bg: 'bg-bg-panel-subtle',
      text: 'text-accent-teal',
      icon: <Lightbulb className="w-4 h-4 text-accent-teal shrink-0" />,
      defaultTitle: 'Practitioner Tip',
    },
    insight: {
      border: 'border-l-accent-teal border-border-base',
      bg: 'bg-bg-panel-subtle',
      text: 'text-accent-teal',
      icon: <ShieldCheck className="w-4 h-4 text-accent-teal shrink-0" />,
      defaultTitle: 'Key Security Insight',
    },
  }

  const config = configs[type] || configs.info
  const displayTitle = title || config.defaultTitle

  return (
    <div
      role="note"
      className={`rounded-r-md border border-l-4 ${config.border} ${config.bg} p-3 sm:p-4 my-3 text-sm leading-relaxed ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5 font-mono text-xs font-semibold tracking-tight">
        {config.icon}
        <span className={config.text}>{displayTitle}</span>
      </div>
      <div className="text-text-primary/90 text-xs sm:text-sm pl-6 leading-relaxed font-sans">
        {children}
      </div>
    </div>
  )
}

export default Callout
