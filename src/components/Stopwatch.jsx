import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function Stopwatch({ startTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - startTime) / 1000)
      setElapsed(diff)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const hours = Math.floor(minutes / 60)
  const displayMins = minutes % 60

  const timeString = hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(displayMins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(displayMins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="flex items-center justify-center gap-4">
      <Clock size={24} className="text-quest-gold animate-pulse" />
      <div className="text-center">
        <p className="font-display text-xs uppercase tracking-widest text-gray-500 mb-1">Time Elapsed</p>
        <p className="font-display text-4xl font-black text-quest-gold tabular-nums" style={{ textShadow: '0 0 20px rgba(240,192,96,0.5)' }}>
          {timeString}
        </p>
      </div>
      <Clock size={24} className="text-quest-gold animate-pulse" />
    </div>
  )
}
