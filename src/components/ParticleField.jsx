import { useMemo } from 'react'

export default function ParticleField() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      dur: (Math.random() * 3 + 2).toFixed(1),
      delay: (Math.random() * 5).toFixed(1),
      opacity: Math.random() * 0.6 + 0.2,
    })), [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map(s => (
        <div key={s.id} className="star absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            opacity: s.opacity,
            '--dur': `${s.dur}s`, '--delay': `${s.delay}s`,
          }} />
      ))}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-1/5 w-80 h-80 rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }} />
      <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />
    </div>
  )
}
