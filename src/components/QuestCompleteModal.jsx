import { useState, useEffect } from 'react'
import { Sparkles, Castle } from 'lucide-react'

export default function QuestCompleteModal({ isVisible, onBackToCastle }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setAnimate(true), 50)
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${
        animate ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        zIndex: 9999,
        background: 'rgba(5,5,10,0.95)',
        backdropFilter: 'blur(8px)',
      }}>
      <div
        className={`relative w-full max-w-sm my-auto text-center space-y-6 transition-all duration-500 ${
          animate ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
        }`}
        style={{ zIndex: 10000 }}>
        
        {/* Animated celebration emojis */}
        <div className="flex justify-center gap-4 text-4xl mb-2">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>✨</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
        </div>

        {/* Main message */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={24} className="text-quest-gold animate-pulse" />
            <h1 className="font-display text-4xl font-black text-quest-gold tracking-wider">
              Quest Complete
            </h1>
            <Sparkles size={24} className="text-quest-gold animate-pulse" />
          </div>
          <p className="font-body text-gray-400 text-sm">
            You've conquered all the missions!
          </p>
        </div>

        {/* Return to Quest Button */}
        <button
          onClick={onBackToCastle}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all btn-press"
          style={{
            boxShadow: '0 0 20px rgba(240,192,96,0.3)',
            zIndex: 10001,
          }}>
          <Castle size={18} />
          Return to Quest
        </button>

        {/* Decorative glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(240,192,96,0.15) 0%, transparent 70%)',
            borderRadius: '0.75rem',
          }}
        />
      </div>
    </div>
  )
}
