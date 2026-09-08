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

  let colorClass = 'text-accent-teal bg-accent-teal/10 border-accent-teal/30'
  if (secondsLeft < 600) {
    colorClass = 'text-accent-danger bg-accent-danger/10 border-accent-danger/30 animate-pulse'
  } else if (secondsLeft < 1200) {
    colorClass = 'text-accent-amber bg-accent-amber/10 border-accent-amber/30'
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded border font-mono font-bold text-xs ${colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>
        {format(minutes)}:{format(seconds)}
      </span>
    </div>
  )
}

export default Timer
