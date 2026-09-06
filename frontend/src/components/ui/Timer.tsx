import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  initialSeconds: number
  onExpire?: () => void
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire()
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          if (onExpire) onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft, onExpire])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  const format = (n: number) => (n < 10 ? `0${n}` : n)

  let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  if (secondsLeft < 600) {
    colorClass = 'text-red-400 bg-red-500/10 border-red-500/30 animate-pulse'
  } else if (secondsLeft < 1200) {
    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${colorClass}`}>
      <Clock className="w-4 h-4" />
      <span>
        {format(minutes)}:{format(seconds)}
      </span>
    </div>
  )
}
