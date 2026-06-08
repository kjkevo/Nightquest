import { useState, useEffect, useCallback } from 'react'
import { Star, Zap, Shield, Sparkles, ChevronRight, RefreshCw, Trophy, Flame, X } from 'lucide-react'
import { RARITY_CONFIG } from '../data/quests'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DifficultyStars({ count = 5, filled = 1 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={11}
          className={i < filled ? 'text-quest-gold fill-quest-gold' : 'text-gray-700 fill-gray-700'} />
      ))}
    </div>
  )
}

function CategoryBadge({ category }) {
  const map = {
    Social:    'bg-blue-900/40 text-blue-300 border-blue-700/40',
    Daring:    'bg-red-900/40 text-red-300 border-red-700/40',
    Challenge: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
    Chill:     'bg-green-900/40 text-green-300 border-green-700/40',
    Wild:      'bg-orange-900/40 text-orange-300 border-orange-700/40',
  }
  return (
    <span className={`text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded border ${map[category] ?? map.Social}`}>
      {category}
    </span>
  )
}

// ─── Circular Countdown Timer ─────────────────────────────────────────────────
function CircularTimer({ totalSeconds, remainingSeconds, timesUp }) {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0
  const strokeDashoffset = circumference * (1 - progress)
  const color = timesUp ? '#ef4444' : progress > 0.6 ? '#22c55e' : progress > 0.3 ? '#f97316' : '#ef4444'
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className={`relative flex items-center justify-center ${timesUp ? 'animate-pulse' : ''}`}>
      <svg width="80" height="80" className="-rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e1e35" strokeWidth="4" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
      </svg>
      <div className="absolute text-center">
        {timesUp ? (
          <span className="font-display text-[10px] font-bold text-red-400 uppercase">Done!</span>
        ) : (
          <span className="font-display text-sm font-bold" style={{ color }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Quest Card ───────────────────────────────────────────────────────────────
export default function QuestCard({ quest, onReroll, onComplete, playerLabel = null, compact = false }) {
  const rarity = RARITY_CONFIG[quest.rarity]
  const Icon = quest.icon

  const [status, setStatus] = useState('idle') // idle | active | done
  const [remainingSeconds, setRemainingSeconds] = useState(
    quest.timeLimitMinutes ? quest.timeLimitMinutes * 60 : 0
  )
  const [timesUp, setTimesUp] = useState(false)

  // Reset when quest changes
  useEffect(() => {
    setStatus('idle')
    setTimesUp(false)
    setRemainingSeconds(quest.timeLimitMinutes ? quest.timeLimitMinutes * 60 : 0)
  }, [quest.id])

  // Countdown
  useEffect(() => {
    if (status !== 'active' || !quest.timeLimitMinutes) return
    if (remainingSeconds <= 0) { setTimesUp(true); return }
    const t = setInterval(() => {
      setRemainingSeconds(s => {
        if (s <= 1) { setTimesUp(true); clearInterval(t); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status, quest.timeLimitMinutes, remainingSeconds])

  const handleAccept = useCallback(() => setStatus('active'), [])
  const handleComplete = useCallback(() => {
    setStatus('done')
    onComplete?.(quest)
  }, [quest, onComplete])
  const handleAbandon = useCallback(() => {
    setStatus('idle')
    setTimesUp(false)
    setRemainingSeconds(quest.timeLimitMinutes ? quest.timeLimitMinutes * 60 : 0)
  }, [quest.timeLimitMinutes])

  const totalSeconds = quest.timeLimitMinutes ? quest.timeLimitMinutes * 60 : 0

  return (
    <div className={`quest-reveal relative border-2 rounded-xl overflow-hidden ${rarity.borderCls} ${compact ? 'p-4' : 'p-5 sm:p-7'}`}
      style={{ background: `linear-gradient(135deg, #12121e 55%, ${rarity.bg})` }}>

      {/* Corner ornaments */}
      <div className="corner-tl absolute top-3 left-3 w-5 h-5" />
      <div className="corner-br absolute bottom-3 right-3 w-5 h-5" />

      {/* Player label (multiplayer) */}
      {playerLabel && (
        <div className="mb-3 flex items-center gap-2">
          <div className="h-px flex-1 bg-quest-border" />
          <span className="font-display text-xs uppercase tracking-widest text-quest-gold px-2">{playerLabel}</span>
          <div className="h-px flex-1 bg-quest-border" />
        </div>
      )}

      {/* Rarity + category row */}
      <div className="flex items-center justify-between mb-4">
        <span className={`font-display text-[10px] uppercase tracking-[0.2em] font-bold ${rarity.textCls}`}>
          ◆ {rarity.label}
        </span>
        <CategoryBadge category={quest.category} />
      </div>

      {/* Icon + Title + Timer row */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center ${rarity.borderCls}`}
          style={{ background: rarity.bg }}>
          <Icon size={22} className={rarity.textCls} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`font-display font-bold text-quest-gold leading-tight ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>
            {quest.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <DifficultyStars count={5} filled={quest.difficulty} />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Difficulty</span>
          </div>
        </div>
        {/* Timer (shown when active and has time limit) */}
        {status === 'active' && quest.timeLimitMinutes && (
          <CircularTimer totalSeconds={totalSeconds} remainingSeconds={remainingSeconds} timesUp={timesUp} />
        )}
      </div>

      {/* Description */}
      {!compact && (
        <p className="font-body text-sm sm:text-base text-gray-200 leading-relaxed mb-4">{quest.description}</p>
      )}
      {compact && (
        <p className="font-body text-sm text-gray-300 leading-snug mb-3 line-clamp-3">{quest.description}</p>
      )}

      {/* Times up banner */}
      {timesUp && status === 'active' && (
        <div className="mb-4 bg-red-950/60 border border-red-700/50 rounded-lg px-3 py-2 flex items-center gap-2 animate-pulse">
          <Flame size={13} className="text-red-400 shrink-0" />
          <span className="text-red-300 font-display text-xs uppercase tracking-widest">Time's Up! Complete or Abandon.</span>
        </div>
      )}

      {/* Tip (hidden when active to save space) */}
      {status === 'idle' && !compact && (
        <div className="bg-quest-panel/80 border border-quest-border rounded-lg px-3 py-2.5 mb-4 flex gap-2 items-start">
          <Zap size={12} className="text-quest-gold shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 font-body italic">
            <span className="text-quest-gold not-italic font-semibold">Tip: </span>{quest.tip}
          </p>
        </div>
      )}

      {/* Stats row */}
      {!compact && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'XP',    value: `+${quest.xp}`,                            icon: <Flame size={11} className="text-orange-400" /> },
            { label: 'Time',  value: quest.timeLimitMinutes ? `${quest.timeLimitMinutes}m` : '∞', icon: <Shield size={11} className="text-blue-400" /> },
            { label: 'Quest', value: `NQ-${String(quest.id).padStart(3,'0')}`,   icon: <Sparkles size={11} className="text-purple-400" /> },
          ].map(s => (
            <div key={s.label} className="bg-quest-panel border border-quest-border rounded-lg p-2 text-center">
              <div className="flex justify-center mb-0.5">{s.icon}</div>
              <div className="font-display text-xs font-bold text-white">{s.value}</div>
              <div className="text-[9px] text-gray-600 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className={`flex gap-2 ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
        {status === 'idle' && (
          <>
            <button onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-display text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg hover:brightness-110 transition-all btn-press shadow-md">
              <ChevronRight size={13} /> Accept Quest
            </button>
            {onReroll && (
              <button onClick={onReroll}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-display text-xs font-bold uppercase tracking-widest border border-quest-border text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
                <RefreshCw size={12} /> Reroll
              </button>
            )}
          </>
        )}
        {status === 'active' && (
          <>
            <button onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-display text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-green-800 to-green-600 text-white hover:brightness-110 transition-all btn-press shadow-md">
              <Trophy size={13} /> Complete — Claim {quest.xp} XP
            </button>
            <button onClick={handleAbandon}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-display text-xs font-bold uppercase tracking-widest border border-red-900/50 text-red-400/70 hover:text-red-300 hover:border-red-700/50 transition-all btn-press">
              <X size={12} /> Abandon
            </button>
          </>
        )}
        {status === 'done' && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-display text-xs font-bold uppercase tracking-widest bg-green-900/30 border border-green-700/40 text-green-400 cursor-default">
            <Trophy size={13} /> Quest Complete! +{quest.xp} XP
          </div>
        )}
      </div>

      {/* Done glow overlay */}
      {status === 'done' && (
        <div className="absolute inset-0 pointer-events-none rounded-xl"
          style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.06), transparent 70%)' }} />
      )}
    </div>
  )
}
