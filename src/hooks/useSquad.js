import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Status Registry ──────────────────────────────────────────────────────────
export const STATUSES = {
  home:          { label: 'At Home',       emoji: '🏠', color: '#6b7280', order: 0 },
  getting_ready: { label: 'Getting Ready', emoji: '💅', color: '#8b5cf6', order: 1 },
  heading_out:   { label: 'Heading Out',   emoji: '🚶', color: '#3b82f6', order: 2 },
  at_pregame:    { label: 'At Pregame',    emoji: '🍺', color: '#22c55e', order: 3 },
  out:           { label: 'Out & About',   emoji: '🎉', color: '#f97316', order: 4 },
  at_venue:      { label: 'At a Venue',    emoji: '📍', color: '#ef4444', order: 5 },
  ride_home:     { label: 'Riding Home',   emoji: '🚗', color: '#06b6d4', order: 6 },
  home_safe:     { label: 'Home Safe ✓',   emoji: '✅', color: '#22c55e', order: 7 },
}

// ─── Mock squad members ───────────────────────────────────────────────────────
const MOCK_MEMBERS = [
  { id: 'alex',   name: 'Alex',   emoji: '🦊', color: '#7c3aed', status: 'getting_ready', mapX: 44, mapY: 39, lastSeen: Date.now() - 240000 },
  { id: 'jordan', name: 'Jordan', emoji: '🐺', color: '#3b82f6', status: 'out',           mapX: 63, mapY: 42, lastSeen: Date.now() - 90000  },
  { id: 'taylor', name: 'Taylor', emoji: '🦁', color: '#f97316', status: 'at_venue',      mapX: 57, mapY: 47, lastSeen: Date.now() - 55000  },
  { id: 'casey',  name: 'Casey',  emoji: '🦋', color: '#ec4899', status: 'heading_out',   mapX: 41, mapY: 52, lastSeen: Date.now() - 170000 },
  { id: 'riley',  name: 'Riley',  emoji: '🐉', color: '#22c55e', status: 'at_pregame',    mapX: 51, mapY: 36, lastSeen: Date.now() - 40000  },
]

// ─── Vote proposals ───────────────────────────────────────────────────────────
const MOCK_PROPOSALS = [
  { id: 'p1', text: 'Club Eclipse → Velvet Underground',   proposedBy: 'taylor' },
  { id: 'p2', text: 'Pregame at Library Bar then Neon Garden', proposedBy: 'alex' },
]

function storedRoom() {
  try { return JSON.parse(localStorage.getItem('nq_squad_room')) } catch { return null }
}
function storedPins() {
  try { return JSON.parse(localStorage.getItem('nq_meetup_pins') || '[]') } catch { return [] }
}

let feedCounter = 0
function mkFeed(type, text, emoji = null, color = null) {
  return { id: feedCounter++, type, text, emoji, color, ts: Date.now() }
}

// Simulate position drift for mock members (±2% per tick)
function driftMember(m) {
  return {
    ...m,
    mapX: Math.max(5, Math.min(90, m.mapX + (Math.random() - 0.5) * 1.5)),
    mapY: Math.max(5, Math.min(90, m.mapY + (Math.random() - 0.5) * 1.5)),
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSquad() {
  const [room, setRoom]           = useState(storedRoom)
  const [members, setMembers]     = useState(() => storedRoom() ? MOCK_MEMBERS : [])
  const [myStatus, setMyStatus]   = useState('home')
  const [myMapPos, setMyMapPos]   = useState({ x: 49, y: 43 })
  const [feed, setFeed]           = useState([])
  const [meetupPins, setMeetupPins] = useState(storedPins)
  const [votes, setVotes]         = useState({ p1: { alex: '✅', taylor: '✅', casey: '🤔' }, p2: { jordan: '✅', riley: '❌' } })
  const [proposals]               = useState(MOCK_PROPOSALS)
  const geoWatchRef               = useRef(null)

  // Persist pins
  useEffect(() => {
    localStorage.setItem('nq_meetup_pins', JSON.stringify(meetupPins))
  }, [meetupPins])

  // Simulate member drift every 30s
  useEffect(() => {
    if (!room) return
    const t = setInterval(() => setMembers(prev => prev.map(driftMember)), 30000)
    return () => clearInterval(t)
  }, [room])

  // Simulated incoming events every ~20s when in room
  useEffect(() => {
    if (!room) return
    const events = [
      () => mkFeed('status', 'Jordan updated: Out & About 🎉', '🐺', '#3b82f6'),
      () => mkFeed('status', 'Taylor is at Club Eclipse 📍',   '🦁', '#f97316'),
      () => mkFeed('status', 'Riley just headed out 🚶',       '🐉', '#22c55e'),
      () => mkFeed('checkin','Alex checked in: The Library Bar','🦊', '#7c3aed'),
    ]
    let i = 0
    const t = setInterval(() => {
      const ev = events[i % events.length]()
      setFeed(prev => [ev, ...prev].slice(0, 40))
      i++
    }, 22000)
    return () => clearInterval(t)
  }, [room])

  // Geolocation watch for current user
  const startLocationShare = useCallback(() => {
    if (!navigator.geolocation) return
    geoWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // Map real lat/lng to our fake map grid (centered on San Francisco downtown approx)
        const mapX = 49 + (pos.coords.longitude + 122.42) * 300
        const mapY = 43 - (pos.coords.latitude  -  37.78) * 300
        setMyMapPos({ x: Math.max(5, Math.min(90, mapX)), y: Math.max(5, Math.min(90, mapY)) })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000 }
    )
  }, [])

  const stopLocationShare = useCallback(() => {
    if (geoWatchRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchRef.current)
      geoWatchRef.current = null
    }
  }, [])

  const createRoom = useCallback(() => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    const r = { code, createdAt: Date.now() }
    localStorage.setItem('nq_squad_room', JSON.stringify(r))
    setRoom(r)
    setMembers(MOCK_MEMBERS)
    setFeed([mkFeed('room', `Room ${code} created — share this code with your squad!`, '🏰', '#f0c060')])
  }, [])

  const joinRoom = useCallback((code) => {
    const r = { code: code.toUpperCase().slice(0, 8), createdAt: Date.now() }
    localStorage.setItem('nq_squad_room', JSON.stringify(r))
    setRoom(r)
    setMembers(MOCK_MEMBERS)
    setFeed([mkFeed('room', `You joined room ${r.code}`, '🚪', '#7c3aed')])
  }, [])

  const leaveRoom = useCallback(() => {
    stopLocationShare()
    localStorage.removeItem('nq_squad_room')
    setRoom(null); setMembers([]); setFeed([]); setVotes({})
  }, [stopLocationShare])

  const broadcastStatus = useCallback((statusKey) => {
    const s = STATUSES[statusKey]
    setMyStatus(statusKey)
    setFeed(prev => [mkFeed('status', `You: ${s.label}`, s.emoji, s.color), ...prev].slice(0, 40))
    // Safe ride alert
    if (statusKey === 'ride_home') {
      setTimeout(() => {
        setFeed(prev => [mkFeed('safe_ride', '🚗 Safe ride alert sent to your squad!', '🛡️', '#06b6d4'), ...prev])
      }, 800)
    }
  }, [])

  const castVote = useCallback((proposalId, vote) => {
    setVotes(prev => ({ ...prev, [proposalId]: { ...(prev[proposalId] || {}), me: vote } }))
    setFeed(prev => [mkFeed('vote', `You voted ${vote} on Plan ${proposalId === 'p1' ? 'A' : 'B'}`, vote, '#f0c060'), ...prev].slice(0, 40))
  }, [])

  const addMeetupPin = useCallback((pin) => {
    setMeetupPins(prev => [...prev, { id: Date.now(), ...pin }])
    setFeed(prev => [mkFeed('pin', `📍 New meetup pin: "${pin.name}"`, '📍', '#f0c060'), ...prev].slice(0, 40))
  }, [])

  const removeMeetupPin = useCallback((id) => {
    setMeetupPins(prev => prev.filter(p => p.id !== id))
  }, [])

  const allHomeSafe = members.length > 0 &&
    members.every(m => m.status === 'home_safe' || m.status === 'home') &&
    (myStatus === 'home_safe' || myStatus === 'home')

  return {
    room, members, myStatus, myMapPos, feed, meetupPins, votes, proposals, allHomeSafe,
    createRoom, joinRoom, leaveRoom, broadcastStatus, castVote,
    addMeetupPin, removeMeetupPin, startLocationShare, stopLocationShare,
  }
}
