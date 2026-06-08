import { useState, useCallback } from 'react'

const KEY = 'nq_planner'

export const SLOT_TYPES = [
  { id: 'pregame', label: 'Pregame',    color: '#22c55e', emoji: '🏠' },
  { id: 'bar',     label: 'Bar Stop',   color: '#3b82f6', emoji: '🍺' },
  { id: 'club',    label: 'Club',       color: '#8b5cf6', emoji: '🎉' },
  { id: 'rave',    label: 'Rave',       color: '#ec4899', emoji: '🎵' },
  { id: 'rooftop', label: 'Rooftop',    color: '#06b6d4', emoji: '🌆' },
  { id: 'food',    label: 'Late Food',  color: '#f97316', emoji: '🍔' },
  { id: 'other',   label: 'Other',      color: '#6b7280', emoji: '📍' },
]

const DEFAULT_SLOTS = [
  { id: 'pre',   type: 'pregame', time: '20:00', venueName: '', venueId: null, notes: '',           travelMinsAfter: 15 },
  { id: 'bar1',  type: 'bar',     time: '22:00', venueName: '', venueId: null, notes: '',           travelMinsAfter: 20 },
  { id: 'club1', type: 'club',    time: '00:00', venueName: '', venueId: null, notes: '',           travelMinsAfter: 30 },
  { id: 'food1', type: 'food',    time: '02:30', venueName: '', venueId: null, notes: 'Last stop',  travelMinsAfter: 0  },
]

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (!saved) return DEFAULT_SLOTS
    // Back-fill travelMinsAfter for older saves
    return saved.map((s, i) => ({ travelMinsAfter: i < saved.length - 1 ? 15 : 0, ...s }))
  } catch { return DEFAULT_SLOTS }
}

function save(slots) {
  try { localStorage.setItem(KEY, JSON.stringify(slots)) } catch {}
}

let _uid = 100

// ─── Time utilities ───────────────────────────────────────────────────────────

/** "HH:MM" → minutes since midnight, or null. */
export function parseTime(t) {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

/** minutes since midnight → "10:30 PM". */
export function formatTime12(mins) {
  if (mins == null) return null
  const wrapped = ((mins % 1440) + 1440) % 1440
  const h24 = Math.floor(wrapped / 60)
  const min  = wrapped % 60
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const h12  = h24 % 12 || 12
  return `${h12}:${String(min).padStart(2, '0')} ${ampm}`
}

/** duration in minutes → "2h 30m" / "45m". */
export function formatDuration(mins) {
  if (!mins || mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && m) return `${h}h ${m}m`
  if (h)      return `${h}h`
  return `${m}m`
}

/**
 * Duration spent AT a slot = (nextSlot.time − slot.time) − travelMinsAfter.
 * Returns null when times are unset or the result would be ≤ 0.
 */
export function computeStopDuration(slot, nextSlot) {
  const a = parseTime(slot.time)
  const b = parseTime(nextSlot?.time)
  if (a == null || b == null) return null
  let diff = b - a
  if (diff < 0) diff += 1440          // midnight wrap
  const dur = diff - (slot.travelMinsAfter ?? 0)
  return dur > 0 ? dur : null
}

// ─── Shareable plan link ──────────────────────────────────────────────────────

export function encodePlan(slots) {
  try {
    const compact = slots.map(s => ({
      t:  s.time           || '',
      ty: s.type           || 'other',
      v:  s.venueName      || '',
      n:  s.notes          || '',
      tr: s.travelMinsAfter ?? 15,
    }))
    const bytes = new TextEncoder().encode(JSON.stringify(compact))
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch { return null }
}

export function decodePlan(str) {
  try {
    if (!str) return null
    const padded = str.replace(/-/g, '+').replace(/_/g, '/')
    const pad    = padded.length % 4 ? 4 - (padded.length % 4) : 0
    const bin    = atob(padded + '='.repeat(pad))
    const bytes  = Uint8Array.from(bin, c => c.charCodeAt(0))
    const data   = JSON.parse(new TextDecoder().decode(bytes))
    if (!Array.isArray(data)) return null
    return data.map((m, i) => ({
      id:             `imp_${i}`,
      time:           m.t  || '',
      type:           m.ty || 'other',
      venueName:      m.v  || '',
      notes:          m.n  || '',
      travelMinsAfter: m.tr ?? 15,
      venueId:        null,
    }))
  } catch { return null }
}

export function getPlanParam() {
  try {
    const p = new URLSearchParams(window.location.search).get('plan')
    return p ? decodePlan(p) : null
  } catch { return null }
}

export function clearPlanParam() {
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has('plan')) {
      url.searchParams.delete('plan')
      window.history.replaceState({}, '', url.toString())
    }
  } catch {}
}

export function buildPlanUrl(slots) {
  const encoded = encodePlan(slots)
  if (!encoded) return null
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?plan=${encoded}`
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function usePlanner() {
  const [slots, setSlots] = useState(load)

  const update = useCallback((fn) => {
    setSlots(prev => { const next = fn(prev); save(next); return next })
  }, [])

  const addSlot = useCallback((after = null) => {
    update(prev => {
      const newSlot = { id: `slot_${++_uid}`, type: 'bar', time: '', venueName: '', venueId: null, notes: '', travelMinsAfter: 15 }
      if (after === null) return [...prev, newSlot]
      const idx = prev.findIndex(s => s.id === after)
      const next = [...prev]
      next.splice(idx + 1, 0, newSlot)
      return next
    })
  }, [update])

  const removeSlot = useCallback((id) => {
    update(prev => prev.filter(s => s.id !== id))
  }, [update])

  const updateSlot = useCallback((id, patch) => {
    update(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [update])

  const moveSlot = useCallback((id, dir) => {
    update(prev => {
      const idx = prev.findIndex(s => s.id === id)
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }, [update])

  const addVenueSlot = useCallback((venue) => {
    update(prev => {
      const typeMap = { Bar: 'bar', Club: 'club', Lounge: 'bar', Rooftop: 'rooftop', Brewery: 'bar', 'Late Food': 'food' }
      return [...prev, {
        id:             `slot_${++_uid}`,
        type:           typeMap[venue.type] || 'other',
        time:           '',
        venueName:      venue.name,
        venueId:        venue.id,
        notes:          venue.neighborhood || '',
        travelMinsAfter: 15,
      }]
    })
  }, [update])

  const importSlots = useCallback((imported) => {
    const stamped = imported.map((s, i) => ({ ...s, id: `imp_${Date.now()}_${i}` }))
    save(stamped)
    setSlots(stamped)
  }, [])

  const clearPlan = useCallback(() => {
    save(DEFAULT_SLOTS)
    setSlots(DEFAULT_SLOTS)
  }, [])

  return { slots, addSlot, removeSlot, updateSlot, moveSlot, addVenueSlot, importSlots, clearPlan }
}
