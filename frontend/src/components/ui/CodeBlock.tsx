import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { notify } from '../../store/toastStore'

interface CodeBlockProps {
  code: string
  language?: string
  showPrompt?: boolean
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  showPrompt = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    notify.success('Copied to clipboard', code.length > 50 ? `${code.slice(0, 47)}...` : code)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`relative group bg-bg-input border border-border-base rounded-md overflow-hidden font-mono text-xs my-2.5 ${className}`}>
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-bg-panel border-b border-border-base text-[11px] text-text-muted select-none">
        <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-base transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
          aria-label="Copy code snippet"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-accent-teal" />
              <span className="text-accent-teal font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3 overflow-x-auto text-text-primary leading-relaxed">
        <pre className="flex items-start">
          {showPrompt && <span className="text-accent-teal select-none pr-2.5 font-bold">$</span>}
          <code className="text-[#A9B7C6] font-mono text-xs">{code}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
