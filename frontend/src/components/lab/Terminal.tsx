import React, { useState } from 'react'
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react'

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
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="bg-[#0A0E1A] border border-gray-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm">
      {/* Header */}
      <div className="bg-gray-900/90 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-gray-400 font-semibold ml-2 flex items-center">
            <TerminalIcon className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            aws-cli-emulator bash
          </span>
        </div>
        <span className="text-xs text-cyan-400/70">LocalStack :4566</span>
      </div>

      {/* Terminal Content */}
      <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="space-y-2">
            <div className="text-xs text-amber-400 font-semibold flex items-center">
              <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mr-2">
                STEP {step.step}
              </span>
              {step.title}
            </div>

            <div className="bg-gray-950/80 border border-gray-800 rounded-lg p-3 relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 text-cyan-300 pr-8 overflow-x-auto">
                  <span className="text-emerald-400 select-none">$</span>
                  <code className="text-cyan-300 font-bold">{step.command}</code>
                </div>

                <button
                  onClick={() => handleCopy(step.command, idx)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded transition-all"
                  title="Copy command"
                >
                  {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {step.expected_output && (
                <div className="mt-2 pt-2 border-t border-gray-800/60 text-xs text-gray-400 font-mono">
                  <div className="text-gray-500 mb-1 select-none"># Output:</div>
                  <pre className="whitespace-pre-wrap bg-black/40 p-2 rounded text-gray-300">{step.expected_output}</pre>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 italic pl-1">{step.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
