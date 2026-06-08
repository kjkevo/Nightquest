import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Default Campus Safety Numbers ───────────────────────────────────────────
export const DEFAULT_CAMPUS_NUMBERS = [
  { id: 'e911',        name: '911 Emergency',       number: '911',         icon: '🚨', category: 'emergency', editable: false, description: 'Police · Fire · Ambulance' },
  { id: 'crisis_text', name: 'Crisis Text Line',    number: '741741',      icon: '💜', category: 'crisis',    editable: false, description: 'Text HOME to this number', isText: true },
  { id: 'poison',      name: 'Poison Control',      number: '18002221222', icon: '🏥', category: 'health',    editable: false, description: '24/7 helpline' },
  { id: 'campus_pd',   name: 'Campus Police',       number: '',            icon: '👮', category: 'campus',    editable: true,  placeholder: 'Your campus PD number' },
  { id: 'safe_walk',   name: 'Safe Walk / Escort',  number: '',            icon: '🚶', category: 'campus',    editable: true,  placeholder: 'Campus escort service' },
  { id: 'campus_ride', name: 'Campus Safe Ride',    number: '',            icon: '🚌', category: 'campus',    editable: true,  placeholder: 'Free campus ride program' },
  { id: 'health_line', name: 'Campus Health',       number: '',            icon: '⚕️',  category: 'campus',    editable: true,  placeholder: 'Campus health center line' },
]

const CONTACTS_KEY     = 'nq_trusted_contacts'
const TIMER_KEY        = 'nq_checkin_timer'
const CAMPUS_KEY       = 'nq_campus_numbers'
const GOT_HOME_KEY     = 'nq_got_home'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSafety() {
  const [contacts, setContacts]       = useState(() => load(CONTACTS_KEY, []))
  const [campusNums, setCampusNums]   = useState(() => load(CAMPUS_KEY, DEFAULT_CAMPUS_NUMBERS))
  const [gotHomeData, setGotHomeData] = useState(() => load(GOT_HOME_KEY, null))

  const [timer, setTimer] = useState(() => load(TIMER_KEY, {
    active: false, intervalMins: 60, nextCheckIn: null, missedCount: 0,
  }))
  const [timeRemaining, setTimeRemaining] = useState(null)  // seconds
  const [overdue, setOverdue]             = useState(false)
  const [location, setLocation]           = useState(null)  // { lat, lng }
  const tickRef = useRef(null)

  // Persist
  useEffect(() => { localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)) }, [contacts])
  useEffect(() => { localStorage.setItem(TIMER_KEY,    JSON.stringify(timer))    }, [timer])
  useEffect(() => { localStorage.setItem(CAMPUS_KEY,   JSON.stringify(campusNums)) }, [campusNums])
  useEffect(() => { if (gotHomeData) localStorage.setItem(GOT_HOME_KEY, JSON.stringify(gotHomeData)) }, [gotHomeData])

  // Tick countdown
  useEffect(() => {
    clearInterval(tickRef.current)
    if (!timer.active || !timer.nextCheckIn) { setTimeRemaining(null); setOverdue(false); return }

    const tick = () => {
      const rem = Math.floor((timer.nextCheckIn - Date.now()) / 1000)
      if (rem <= 0) {
        setTimeRemaining(0)
        setOverdue(true)
        // Browser notification (if permitted)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification('NightQuest — Check-in Overdue', {
              body: "Your buddy check-in timer expired. Tap to confirm you're OK.",
              icon: '/favicon.ico',
            })
          } catch {}
        }
      } else {
        setTimeRemaining(rem)
        setOverdue(false)
      }
    }
    tick()
    tickRef.current = setInterval(tick, 1000)
    return () => clearInterval(tickRef.current)
  }, [timer])

  // Ask for notification permission when hook first loads
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  // Try to get current position for ride links
  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  // ── Timer actions ──
  const startTimer = useCallback((intervalMins) => {
    const nextCheckIn = Date.now() + intervalMins * 60 * 1000
    setTimer({ active: true, intervalMins, nextCheckIn, missedCount: 0 })
    setOverdue(false)
    refreshLocation()
  }, [refreshLocation])

  const confirmCheckIn = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      nextCheckIn: Date.now() + prev.intervalMins * 60 * 1000,
      missedCount: 0,
    }))
    setOverdue(false)
    refreshLocation()
  }, [refreshLocation])

  const stopTimer = useCallback(() => {
    clearInterval(tickRef.current)
    setTimer({ active: false, intervalMins: 60, nextCheckIn: null, missedCount: 0 })
    setTimeRemaining(null)
    setOverdue(false)
  }, [])

  const snoozeTimer = useCallback((extraMins = 15) => {
    setTimer(prev => ({
      ...prev,
      nextCheckIn: Date.now() + extraMins * 60 * 1000,
    }))
    setOverdue(false)
  }, [])

  // ── Contacts ──
  const addContact = useCallback((c) => {
    setContacts(prev => [...prev, { id: Date.now(), ...c }])
  }, [])
  const removeContact = useCallback((id) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }, [])
  const updateContact = useCallback((id, patch) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])

  // ── Campus numbers ──
  const updateCampusNum = useCallback((id, number) => {
    setCampusNums(prev => prev.map(n => n.id === id ? { ...n, number } : n))
  }, [])

  // ── Got home ──
  const confirmGotHome = useCallback(() => {
    const data = { ts: Date.now() }
    setGotHomeData(data)
    stopTimer()
    return data
  }, [stopTimer])

  const clearGotHome = useCallback(() => {
    setGotHomeData(null)
    localStorage.removeItem(GOT_HOME_KEY)
  }, [])

  // ── SMS message builders ──
  const buildAlertSMS = useCallback((contactName = 'your friend') => {
    const locStr = location
      ? `\nLast known location: https://maps.google.com/maps?q=${location.lat},${location.lng}`
      : ''
    return `⚠️ NightQuest buddy alert: ${contactName} hasn't confirmed their check-in. Please reach out to make sure they're safe.${locStr}`
  }, [location])

  const buildGotHomeSMS = useCallback(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `✅ I got home safely at ${time}! Good night. — NightQuest`
  }, [])

  const buildPlanSummary = useCallback(() => {
    const slots = load('nq_planner', [])
    const lines = slots.filter(s => s.venueName).map(s => `${s.time || '--:--'} ${s.venueName}`)
    const planStr = lines.length ? lines.join(' → ') : 'a night out'
    const locStr  = location ? ` My current location: https://maps.google.com/maps?q=${location.lat},${location.lng}` : ''
    return `📍 Tonight's plan: ${planStr}. I'll check in regularly.${locStr} — NightQuest`
  }, [location])

  // ── Ride URL builder ──
  const getRideUrl = useCallback((service) => {
    const lat = location?.lat, lng = location?.lng
    if (service === 'uber') {
      return lat && lng
        ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${lat}&pickup[longitude]=${lng}&pickup[nickname]=My+Location`
        : 'https://m.uber.com'
    }
    if (service === 'lyft') {
      return lat && lng
        ? `https://lyft.com/ride?pickup=auto`
        : 'https://lyft.com/ride'
    }
    if (service === 'waymo') return 'https://waymo.com/intl/us/waymoone/'
    return '#'
  }, [location])

  // ── SMS link builder ──
  const smsLink = useCallback((phone, body) => {
    const cleaned = phone.replace(/\D/g, '')
    const encoded = encodeURIComponent(body)
    // iOS uses &body=, Android uses ?body= — the & form works on both
    return `sms:${cleaned}&body=${encoded}`
  }, [])

  return {
    // Contacts
    contacts, addContact, removeContact, updateContact,
    // Timer
    timer, timeRemaining, overdue,
    startTimer, confirmCheckIn, stopTimer, snoozeTimer,
    // Campus
    campusNums, updateCampusNum,
    // Got home
    gotHomeData, confirmGotHome, clearGotHome,
    // Location
    location, refreshLocation,
    // Builders
    buildAlertSMS, buildGotHomeSMS, buildPlanSummary, getRideUrl, smsLink,
  }
}
