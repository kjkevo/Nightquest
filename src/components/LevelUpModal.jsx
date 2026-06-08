import { Crown, Star, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LevelUpModal({ levelInfo, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(5,5,10,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={handleDismiss}
    >
      <div
        className={`relative max-w-sm w-full rounded-2xl border-2 border-quest-gold p-8 text-center transition-all duration-500 ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}`}
        style={{ background: 'linear-gradient(135deg, #12121e 0%, #1a0a2e 100%)', boxShadow: '0 0 60px rgba(240,192,96,0.3), 0 0 120px rgba(124,58,237,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Corner ornaments */}
        <div className="corner-tl absolute top-4 left-4 w-6 h-6" />
        <div className="corner-br absolute bottom-4 right-4 w-6 h-6" />

        {/* Floating crown */}
        <div className="flex justify-center mb-4">
          <div className="animate-float w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(240,192,96,0.2), transparent 70%)', boxShadow: '0 0 30px rgba(240,192,96,0.4)' }}>
            <Crown size={44} className="text-quest-gold" />
          </div>
        </div>

        <p className="font-display text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">Level Up!</p>
        <div className="font-display text-7xl font-black text-shimmer mb-2">{levelInfo.level}</div>
        <h2 className="font-display text-2xl font-bold text-quest-gold mb-1">{levelInfo.title}</h2>
        <p className="font-body text-gray-400 text-sm mb-6">You have ascended. The night bows before you.</p>

        {/* XP display */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-quest-panel border border-quest-border rounded-lg px-4 py-2">
          <Zap size={14} className="text-quest-gold" />
          <span className="font-display text-sm text-gray-300">
            Total XP: <span className="text-quest-gold font-bold">{levelInfo.totalXP.toLocaleString()}</span>
          </span>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: Math.min(levelInfo.level, 10) }).map((_, i) => (
            <Star key={i} size={14} className="text-quest-gold fill-quest-gold"
              style={{ animationDelay: `${i * 0.06}s`, animation: 'twinkle 1.5s ease-in-out infinite' }} />
          ))}
        </div>

        <button onClick={handleDismiss}
          className="w-full py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg hover:brightness-110 transition-all btn-press">
          Continue the Quest
        </button>
      </div>
    </div>
  )
}
