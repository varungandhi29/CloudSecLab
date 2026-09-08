import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success'
        const isError = t.type === 'error'

        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all duration-200 ${
              isSuccess
                ? 'bg-bg-panel border-accent-teal/40 text-text-primary'
                : isError
                ? 'bg-bg-panel border-accent-danger/40 text-text-primary'
                : 'bg-bg-panel border-border-base text-text-primary'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-accent-teal" />}
              {isError && <AlertCircle className="w-4 h-4 text-accent-danger" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-text-muted" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold font-mono tracking-tight text-text-primary">
                {t.title}
              </div>
              {t.description && (
                <div className="text-xs text-text-muted mt-0.5 leading-normal">
                  {t.description}
                </div>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-text-muted hover:text-text-primary p-0.5 rounded focus-visible:ring-1 focus-visible:ring-accent-amber"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
export default ToastContainer
