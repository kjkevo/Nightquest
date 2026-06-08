import { useState, useCallback } from 'react'

const KEY = 'nq_nights_history'
const SESSION_KEY = 'nq_session_start'

function load(k, fb) { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fb } catch { return fb } }
function save(k, v)  { localStorage.setItem(k, JSON.stringify(v)) }

function getSemester(date = new Date()) {
  const m = date.getMonth() // 0-11
  const y = date.getFullYear()
  if (m >= 0  && m <= 4)  return `Spring ${y}`
  if (m >= 5  && m <= 7)  return `Summer ${y}`
  return `Fall ${y}`
}

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateNarrative(data) {
  const venue0   = data.venues[0]  || 'a mystery spot'
  const venueLast = data.venues[data.venues.length - 1] || venue0
  const count    = data.venues.length
  const squad    = data.squad.length ? data.squad.join(', ') : 'the crew'

  const openings = [
    `${data.date} — the night started at ${venue0} and never really stopped.`,
    `Another entry in the books. ${venue0} set the tone for what turned into a full mission.`,
    `The squad assembled. ${venue0} was the launchpad. ${squad} ready to go.`,
    `It was supposed to be a chill one. ${venue0} had other plans.`,
  ]

  const middles = count > 1
    ? [
        `${count} venues deep — ${data.venues.join(' → ')}. Each stop raised the stakes.`,
        `The crawl: ${data.venues.join(', ')}. ${count} different vibes, zero complaints.`,
        `From ${venue0} to ${venueLast}, the night covered ${data.milesWalked.toFixed(1)} miles of ground.`,
      ]
    : [`One venue. All night. ${venue0} held it down.`]

  const endings = [
    `${data.questsCompleted} quest${data.questsCompleted !== 1 ? 's' : ''} completed. +${data.xpEarned} XP. ${data.mood === 'legendary' ? 'Legendary.' : 'Worth it.'}`,
    `The squad walked ${data.milesWalked.toFixed(1)} miles and left nothing on the table.`,
    `Vibe: ${data.mood.toUpperCase()}. Tab: ~$${data.totalSpent}. Memories: priceless.`,
    `Home safe at ${data.endTime}. The ${getSemester()} diary grows.`,
  ]

  return `${randomPick(openings)} ${randomPick(middles)} ${randomPick(endings)}`
}

// Pull live data from localStorage sources to build tonight's recap
function buildRecapFromSession() {
  const planner   = load('nq_planner',  [])
  const xp        = load('nq_xp', 0)
  const history   = load('nq_history', [])
  const costs     = load('nq_costs', [])
  const squadRoom = load('nq_squad_room', null)
  const sessionXP = load('nq_session_xp', 0)
  const sessionStart = load(SESSION_KEY, Date.now() - 3 * 3600000)

  const venues  = planner.filter(s => s.venueName).map(s => s.venueName)
  const questsCompleted = history.filter(h => h.completedAt > sessionStart).length
  const xpEarned = sessionXP
  const totalSpent = costs.reduce((s, e) => s + (e.amount || 0), 0)
  const milesWalked = venues.length * 0.4 + Math.random() * 0.6  // rough estimate

  const now = new Date()
  const squad = squadRoom ? ['Alex', 'Jordan', 'Taylor'] : []  // from mock squad

  const moodMap = [
    [0,  100, 'quiet'],
    [1,  250, 'good'],
    [2,  600, 'great'],
    [3,  99, 'legendary'],
  ]
  let mood = 'good'
  for (const [minQ, minXP, m] of moodMap) {
    if (questsCompleted >= minQ && xpEarned >= minXP) mood = m
  }
  if (questsCompleted >= 4) mood = 'legendary'

  return {
    date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    semester: getSemester(now),
    venues,
    squad,
    questsCompleted,
    xpEarned,
    totalSpent: Math.round(totalSpent),
    milesWalked,
    startTime: new Date(sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mood,
  }
}

export function useMemories() {
  const [nights, setNights] = useState(() => load(KEY, []))

  const saveNight = useCallback((overrides = {}) => {
    const base = buildRecapFromSession()
    const data = { ...base, ...overrides }
    const entry = {
      id: `night_${Date.now()}`,
      ...data,
      narrative: generateNarrative(data),
      savedAt: Date.now(),
    }
    setNights(prev => {
      const next = [entry, ...prev].slice(0, 100)
      save(KEY, next)
      return next
    })
    // Reset session XP
    save('nq_session_xp', 0)
    save(SESSION_KEY, Date.now())
    return entry
  }, [])

  const deleteNight = useCallback((id) => {
    setNights(prev => {
      const next = prev.filter(n => n.id !== id)
      save(KEY, next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setNights([])
    localStorage.removeItem(KEY)
  }, [])

  // Track XP earned this session
  const addSessionXP = useCallback((amount) => {
    const current = load('nq_session_xp', 0)
    save('nq_session_xp', current + amount)
  }, [])

  // Group nights by semester
  const bySemester = nights.reduce((acc, n) => {
    const sem = n.semester || getSemester(new Date(n.savedAt))
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(n)
    return acc
  }, {})

  const stats = {
    totalNights: nights.length,
    totalXP: nights.reduce((s, n) => s + (n.xpEarned || 0), 0),
    totalVenues: [...new Set(nights.flatMap(n => n.venues || []))].length,
    totalMiles: nights.reduce((s, n) => s + (n.milesWalked || 0), 0),
    legendaryNights: nights.filter(n => n.mood === 'legendary').length,
    totalQuests: nights.reduce((s, n) => s + (n.questsCompleted || 0), 0),
  }

  const liveRecap = buildRecapFromSession()

  return { nights, bySemester, stats, liveRecap, saveNight, deleteNight, clearAll, addSessionXP }
}
