import { useEffect, useState, useRef } from 'react'
import { Zap, RefreshCw, ArrowRight, Trophy, Star, BookOpen, CheckCircle, Sparkles, Castle } from 'lucide-react'
import { getLevelInfo } from '../data/quests'
import { useMemories } from '../hooks/useMemories'
import { usePlayerName } from '../hooks/usePlayerName'

// ─── Per-venue visual identity ────────────────────────────────────────────────
const VENUE_THEME = {
  bar:     { glow: '#f59e0b', ring: 'rgba(245,158,11,0.25)',  accent: '#fbbf24' },
  club:    { glow: '#8b5cf6', ring: 'rgba(139,92,246,0.25)',  accent: '#a78bfa' },
  rave:    { glow: '#ec4899', ring: 'rgba(236,72,153,0.25)',  accent: '#f472b6' },
  openmic: { glow: '#22d3ee', ring: 'rgba(34,211,238,0.25)', accent: '#67e8f9' },
  custom:  { glow: '#7c3aed', ring: 'rgba(124,58,237,0.25)', accent: '#a78bfa' },
}

// ─── Earned night badge per difficulty ───────────────────────────────────────
const NIGHT_BADGE = {
  easy:   { emoji: '🌙', title: 'Night Owl',      subtitle: 'You warmed up the night.',         color: '#22c55e' },
  medium: { emoji: '⚔️',  title: 'Quest Champion', subtitle: 'Courage and commitment. Respect.', color: '#f59e0b' },
  hard:   { emoji: '👑',  title: 'Night Legend',   subtitle: 'Not many go this hard. You did.',  color: '#ef4444' },
  custom: { emoji: '🎯', title: 'Game Master',    subtitle: 'You ran the table on a custom set.',color: '#a78bfa' },
}

// ─── Animated XP number (counts up) ──────────────────────────────────────────
function CountUp({ target, duration = 800 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - pct, 3)
      setVal(Math.round(ease * target))
      if (pct < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, duration])
  return <>{val}</>
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NightComplete({
  outing, difficulty, xpEarned, tasksCompleted, totalXP, onPlayAgain, onNewOuting, onReturnHome,
}) {
  const [visible,    setVisible]    = useState(false)
  const [saveState,  setSaveState]  = useState('idle')  // 'idle' | 'saved'
  const [savedEntry, setSavedEntry] = useState(null)
  const { saveNight } = useMemories()
  const { name, setName } = usePlayerName()
  const [draft,    setDraft]    = useState('')
  const [nameSet,  setNameSet]  = useState(false)  // true once confirmed this session
  const inputRef = useRef(null)

  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id) }, [])

  const confirmName = () => {
    const trimmed = draft.trim()
    if (trimmed) { setName(trimmed); setNameSet(true) }
  }

  // resolved display name — either already stored or confirmed this session
  const displayName = name || (nameSet ? draft.trim() : null)

  const handleSave = () => {
    if (saveState === 'saved') return
    const entry = saveNight({
      xpEarned:        xpEarned,
      questsCompleted: tasksCompleted,
      ...(outing ? { venues: [outing.label] } : {}),
    })
    setSavedEntry(entry)
    setSaveState('saved')
  }

  const vc    = VENUE_THEME[outing?.id] ?? VENUE_THEME.bar
  const badge = NIGHT_BADGE[difficulty?.id] ?? NIGHT_BADGE.easy
  const lv    = getLevelInfo(totalXP)

  const handleReturnToBase = onReturnHome ?? onNewOuting ?? onPlayAgain

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(5,5,10,0.92)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className={`relative w-full max-w-md my-auto space-y-3 transition-all duration-500 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >

      {/* ── Hero headline — "You've Conquered The Night" ───────────── */}
      <div className="text-center py-4 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Sparkles size={18} className="text-quest-gold" />
          <h1 className="font-display text-2xl sm:text-3xl font-black text-quest-gold tracking-wide leading-tight">
            You've Conquered<br className="sm:hidden" /> The Night
          </h1>
          <Sparkles size={18} className="text-quest-gold" />
        </div>
        {displayName && (
          <p className="font-body text-sm text-gray-400 italic mt-1">
            Well done, <span className="text-white font-semibold not-italic">{displayName}</span>.
          </p>
        )}
      </div>

      {/* ── Name prompt (only if no name yet) ──────────────────────── */}
      {!displayName && (
        /* Name prompt — shown once, never again after saved */
        <div className="rounded-2xl border border-quest-border bg-quest-panel px-4 py-4 space-y-3 animate-fade-in">
          <p className="font-display text-sm font-black text-white text-center">
            🎉 Quest Complete!
          </p>
          <p className="font-body text-xs text-gray-500 text-center">
            Enter your name so we can celebrate you properly.
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              placeholder="Your name…"
              maxLength={24}
              autoFocus
              className="flex-1 bg-quest-bg border border-quest-border rounded-xl px-3 py-2.5 font-display text-sm text-white placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors"
            />
            <button
              onClick={confirmName}
              disabled={!draft.trim()}
              className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-widest transition-all btn-press ${
                draft.trim()
                  ? 'text-quest-bg'
                  : 'text-gray-600 bg-quest-bg border border-quest-border cursor-not-allowed'
              }`}
              style={draft.trim() ? { background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' } : {}}>
              Go
            </button>
          </div>
        </div>
      )}

      {/* ── Main reward card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-quest-border bg-quest-panel overflow-hidden"
        style={{ boxShadow: `0 0 40px ${vc.ring}` }}>

        {/* Coloured top bar */}
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${vc.glow}, transparent)` }} />

        <div className="px-5 py-7 text-center space-y-5">

          {/* Venue badge (floating emoji) */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-float"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${vc.ring}, transparent 72%)`,
                border: `2px solid ${vc.glow}55`,
                boxShadow: `0 0 32px ${vc.ring}, 0 0 60px ${vc.ring}`,
              }}>
              {outing?.emoji}
            </div>
          </div>

          {/* Heading */}
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-0.5">Night Complete</p>
            <h2 className="font-display text-xl font-black text-white">{outing?.label}</h2>
          </div>

          {/* XP earned — big animated count-up */}
          <div className="flex items-center justify-center gap-3 py-4 rounded-xl"
            style={{ background: 'rgba(240,192,96,0.08)', border: '1px solid rgba(240,192,96,0.2)' }}>
            <Zap size={18} className="text-quest-gold shrink-0" />
            <span className="font-display text-5xl font-black text-quest-gold">
              +<CountUp target={xpEarned} duration={900} />
            </span>
            <span className="font-display text-sm uppercase tracking-wider text-gray-500 self-end pb-1">XP</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tasks done */}
            <div className="rounded-xl bg-quest-bg border border-quest-border px-3 py-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Trophy size={13} className="text-quest-gold" />
                <span className="font-display text-xl font-black text-white">{tasksCompleted}</span>
              </div>
              <p className="font-display text-[9px] uppercase tracking-wider text-gray-600">Missions Done</p>
            </div>

            {/* Night badge */}
            <div className="rounded-xl border px-3 py-3 text-center"
              style={{ background: `${badge.color}0f`, borderColor: `${badge.color}33` }}>
              <div className="text-xl mb-0.5">{badge.emoji}</div>
              <p className="font-display text-[9px] uppercase tracking-wider font-bold" style={{ color: badge.color }}>
                {badge.title}
              </p>
            </div>
          </div>

          {/* Badge subtitle */}
          <p className="font-body text-xs italic text-gray-500">{badge.subtitle}</p>

          {/* Level progress strip */}
          <div className="rounded-xl bg-quest-bg border border-quest-border px-4 py-3 text-left space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="font-display text-xs font-bold text-gray-300">
                Lv {lv.level} · {lv.title}
              </span>
              <span className="font-display text-xs text-quest-gold">{lv.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${lv.progress}%`,
                  background: 'linear-gradient(90deg, rgb(var(--nq-gold-dim)), rgb(var(--nq-gold)), #ffe9a0)',
                  boxShadow: '0 0 6px rgba(240,192,96,0.5)',
                }} />
            </div>
            {lv.next ? (
              <p className="text-[9px] text-gray-600 font-display uppercase tracking-wider text-right">
                {lv.xpIntoLevel.toLocaleString()} / {lv.xpForNextLevel.toLocaleString()} → {lv.next.title}
              </p>
            ) : (
              <p className="text-[9px] text-quest-gold font-display uppercase tracking-wider text-right">Max Level Reached</p>
            )}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1">
            {Array.from({ length: Math.min(tasksCompleted, 10) }).map((_, i) => (
              <Star key={i} size={11} className="text-quest-gold fill-quest-gold"
                style={{ animation: `twinkle 1.8s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Save this Night panel ──────────────────────────────────── */}
      {saveState === 'idle' ? (
        <button onClick={handleSave}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all btn-press animate-fade-in"
          style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.07)' }}>
          <BookOpen size={16} className="text-purple-400 shrink-0" />
          <div className="flex-1 text-left">
            <p className="font-display text-xs font-bold text-white uppercase tracking-wider">Save this Night</p>
            <p className="font-body text-[10px] text-gray-500 mt-0.5">Add to your nights journal — no account needed</p>
          </div>
          <ArrowRight size={13} className="text-purple-400 shrink-0" />
        </button>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-green-900/40 animate-fade-in"
          style={{ background: 'rgba(34,197,94,0.07)' }}>
          <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-display text-xs font-bold text-green-400 uppercase tracking-wider">Night Saved</p>
            {savedEntry?.narrative && (
              <p className="font-body text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed italic">
                "{savedEntry.narrative}"
              </p>
            )}
            <p className="font-display text-[9px] text-gray-700 uppercase tracking-widest mt-1">
              Tap Nights tab to see your journal
            </p>
          </div>
        </div>
      )}

      {/* ── PRIMARY action — Return to Base ────────────────────────── */}
      <button onClick={handleReturnToBase}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display text-base font-black uppercase tracking-widest transition-all btn-press hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, rgb(var(--nq-gold-dim)), rgb(var(--nq-gold)))',
          color: '#0a0a0f',
          boxShadow: '0 0 28px rgba(240,192,96,0.45)',
        }}>
        <Castle size={16} /> Return to Base
      </button>

      {/* Secondary actions (smaller, only if "Same Again" is meaningfully different) */}
      {onPlayAgain && onPlayAgain !== handleReturnToBase && (
        <button onClick={onPlayAgain}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border font-display text-[10px] uppercase tracking-widest transition-all btn-press hover:brightness-110"
          style={{ borderColor: `${vc.glow}55`, color: vc.glow, background: `${vc.ring}` }}>
          <RefreshCw size={11} /> Same Outing — New Missions
        </button>
      )}
      </div>
    </div>
  )
}
