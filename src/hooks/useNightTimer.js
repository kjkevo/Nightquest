import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'nq_night_start'

function safeRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

// ─── Phase definitions (minute thresholds) ───────────────────────────────────
export const NIGHT_PHASES = [
  {
    id: 'warmup',
    label: 'Warm-up',
    minMinutes: 0,
    color: '#22c55e',
    dot: '🌱',
    tip: 'Scout the room, claim your spot, make first contacts. Easy missions are your best move right now.',
    // Categories that are "in phase" for party quests
    categories: ['Social', 'Chill'],
  },
  {
    id: 'rising',
    label: 'Rising',
    minMinutes: 20,
    color: '#f59e0b',
    dot: '⬆',
    tip: "You've settled in. Social energy is peaking — go for the conversation and daring missions.",
    categories: ['Social', 'Daring'],
  },
  {
    id: 'peak',
    label: 'Peak Night',
    minMinutes: 45,
    color: '#f97316',
    dot: '🔥',
    tip: "This is it — prime time. Do the bold, challenging stuff while collective energy is highest.",
    categories: ['Daring', 'Challenge', 'Wild'],
  },
  {
    id: 'late',
    label: 'Late Night',
    minMinutes: 90,
    color: '#ef4444',
    dot: '🌙',
    tip: 'Legendary territory. Last call is coming. Make the moves that create stories.',
    categories: ['Wild', 'Challenge'],
  },
]

function getPhase(elapsedMinutes) {
  let phase = NIGHT_PHASES[0]
  for (const p of NIGHT_PHASES) {
    if (elapsedMinutes >= p.minMinutes) phase = p
  }
  return phase
}

export function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useNightTimer() {
  const [startedAt, setStartedAt] = useState(() => safeRead(STORAGE_KEY, null))
  const [elapsed, setElapsed]     = useState(0)  // seconds
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!startedAt) { setElapsed(0); clearInterval(intervalRef.current); return }

    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => clearInterval(intervalRef.current)
  }, [startedAt])

  /** Call when the first quest session of the night begins.
   *  If a night is already running (tab reopened) this is a no-op. */
  const startNight = () => {
    if (startedAt) return   // already running — preserve existing start
    const now = Date.now()
    setStartedAt(now)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(now)) } catch {}
  }

  /** Explicitly end the night (called from the timer bar "End Night" button). */
  const endNight = () => {
    setStartedAt(null)
    setElapsed(0)
    localStorage.removeItem(STORAGE_KEY)
  }

  const elapsedMinutes = Math.floor(elapsed / 60)
  const phase          = getPhase(elapsedMinutes)
  const phaseIndex     = NIGHT_PHASES.findIndex(p => p.id === phase.id)
  const formatted      = startedAt ? formatElapsed(elapsed) : null

  return {
    started:        !!startedAt,
    elapsed,          // raw seconds
    elapsedMinutes,
    formatted,        // "42m" / "1h 03m" / null if not started
    phase,            // current NIGHT_PHASES entry
    phaseIndex,       // 0-3
    startNight,
    endNight,
    PHASES: NIGHT_PHASES,
  }
}
