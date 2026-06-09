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
    <div className="bg-quest-panel border border-quest-border rounded-xl px-4 py-3 flex items-center gap-3">
      <Clock size={16} className="text-quest-gold shrink-0" />
      <div className="flex-1">
        <p className="font-display text-xs uppercase tracking-widest text-gray-600">Time Elapsed</p>
        <p className="font-display text-lg font-black text-quest-gold tabular-nums">{timeString}</p>
      </div>
    </div>
  )
}
