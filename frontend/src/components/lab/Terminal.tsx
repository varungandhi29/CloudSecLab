import React, { useState } from 'react'
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react'
import { notify } from '../../store/toastStore'

interface StepCommand {
  step: number
  title: string
  command: string
  expected_output: string
  explanation: string
}

interface TerminalProps {
  steps: StepCommand[]
}

export const Terminal: React.FC<TerminalProps> = ({ steps }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    notify.success('Copied command', text)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="bg-bg-input border border-border-base rounded-lg overflow-hidden font-mono text-xs shadow-xl">
      {/* Header */}
      <div className="bg-bg-panel px-3.5 py-2 border-b border-border-base flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-danger/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-teal/70" />
          </div>
          <span className="text-[11px] text-text-muted font-semibold ml-2 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-accent-teal" />
            <span>aws-cli bash emulator</span>
          </span>
        </div>
        <span className="text-[11px] text-accent-teal font-mono">LocalStack :4566</span>
      </div>

      {/* Terminal Content */}
      <div className="p-3.5 space-y-4 max-h-[500px] overflow-y-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="text-xs text-accent-amber font-semibold flex items-center gap-1.5">
              <span className="bg-bg-base border border-border-base px-1.5 py-0.5 rounded text-[10px]">
                STEP {step.step}
              </span>
              <span>{step.title}</span>
            </div>

            <div className="bg-bg-base border border-border-base rounded p-2.5 relative group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 text-text-primary overflow-x-auto">
                  <span className="text-accent-teal select-none font-bold">$</span>
                  <code className="text-[#A9B7C6] font-mono">{step.command}</code>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(step.command, idx)}
                  className="p-1 text-text-muted hover:text-text-primary bg-bg-panel rounded transition-colors shrink-0 focus-visible:ring-1 focus-visible:ring-accent-amber"
                  title="Copy command"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-accent-teal" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {step.expected_output && (
                <div className="mt-2 pt-2 border-t border-border-subtle text-[11px] text-text-muted font-mono">
                  <div className="text-[10px] text-text-muted uppercase mb-0.5 select-none"># Output:</div>
                  <pre className="whitespace-pre-wrap bg-bg-input p-2 rounded text-text-primary leading-tight">{step.expected_output}</pre>
                </div>
              )}
            </div>

            {step.explanation && (
              <p className="text-[11px] text-text-muted italic pl-1 leading-normal m-0">{step.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Terminal
