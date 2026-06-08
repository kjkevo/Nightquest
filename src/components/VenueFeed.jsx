import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search, MapPin, Clock, Users, DollarSign, Shield, Star,
  ChevronDown, ChevronUp, Zap, CheckCircle, AlertCircle,
  GraduationCap, Filter, RefreshCw, Plus, TrendingUp, X, Stamp,
  Navigation, RotateCcw,
} from 'lucide-react'
import {
  VENUES, VENUE_TYPES, isOpenNow, computeBusyness, getCurrentHappyHour,
  getTodaySpecials, formatCover, busynessLabel, submitCheckin,
  getCheckinBusyness, reportCover, getCrowdCover,
} from '../data/venues'
import MicroReviewWidget from './MicroReviewWidget'
import LocationPrompt from './LocationPrompt'
import { useLocation } from '../hooks/useLocation'
import { useCustomVenues } from '../hooks/useCustomVenues'

// ─── Busyness Bar ─────────────────────────────────────────────────────────────
function BusynessMeter({ pct }) {
  const { label, color } = busynessLabel(pct)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={10} style={{ color }} />
          <span className="font-display text-[10px] uppercase tracking-wider" style={{ color }}>{label}</span>
        </div>
        <span className="font-display text-[10px] font-bold text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}88` }} />
      </div>
    </div>
  )
}

// ─── Cover Badge ──────────────────────────────────────────────────────────────
function CoverBadge({ venue }) {
  const crowd = getCrowdCover(venue.id)
  const display = crowd ? crowd.amount : venue.coverCharge.amount
  const isCrowdsourced = !!crowd

  return (
    <div className="flex items-center gap-1 bg-quest-panel border border-quest-border rounded-lg px-2 py-1">
      <DollarSign size={10} className={display === 0 ? 'text-green-400' : 'text-yellow-400'} />
      <span className={`font-display text-[10px] font-bold ${display === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
        {display === 0 ? 'Free' : `$${display}`}
      </span>
      {isCrowdsourced && (
        <span className="text-[9px] text-purple-400 ml-0.5" title="Crowdsourced report">👥</span>
      )}
      {venue.coverCharge.verified && !isCrowdsourced && (
        <CheckCircle size={8} className="text-green-500 ml-0.5" />
      )}
    </div>
  )
}

// ─── Check-in Modal ───────────────────────────────────────────────────────────
function CheckinModal({ venue, onClose }) {
  const levels = [
    { label: 'Dead',    value: 10,  color: '#6b7280' },
    { label: 'Mellow',  value: 30,  color: '#22c55e' },
    { label: 'Lively',  value: 60,  color: '#eab308' },
    { label: 'Busy',    value: 80,  color: '#f97316' },
    { label: 'Packed',  value: 95,  color: '#ef4444' },
  ]
  const [done, setDone] = useState(false)
  const [selected, setSelected] = useState(null)

  const submit = (val) => {
    setSelected(val)
    submitCheckin(venue.id, val)
    setTimeout(() => { setDone(true) }, 300)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(5,5,10,0.80)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm bg-quest-panel border border-quest-border rounded-2xl p-5 animate-slide-up"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-gray-500">Check In</p>
            <h3 className="font-display text-base font-bold text-quest-gold">{venue.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400"><X size={16} /></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
            <p className="font-display text-sm text-green-400 uppercase tracking-wider">Thanks! Busyness updated.</p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-gray-400 mb-4">How busy is it right now?</p>
            <div className="grid grid-cols-5 gap-2">
              {levels.map(l => (
                <button key={l.label} onClick={() => submit(l.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all btn-press
                    ${selected === l.value ? 'border-opacity-80 scale-95' : 'border-quest-border hover:border-gray-500'}`}
                  style={selected === l.value ? { borderColor: l.color, background: l.color + '22' } : {}}>
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span className="text-[9px] font-display text-gray-400 uppercase tracking-wide leading-none text-center">{l.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Cover Report Modal ───────────────────────────────────────────────────────
function CoverReportModal({ venue, onClose }) {
  const [amount, setAmount] = useState(venue.coverCharge.amount)
  const [done, setDone] = useState(false)

  const submit = () => {
    reportCover(venue.id, Number(amount))
    setDone(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(5,5,10,0.80)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm bg-quest-panel border border-quest-border rounded-2xl p-5 animate-slide-up"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-gray-500">Report Cover Charge</p>
            <h3 className="font-display text-base font-bold text-quest-gold">{venue.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400"><X size={16} /></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
            <p className="font-display text-sm text-green-400 uppercase tracking-wider">Report saved!</p>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-gray-400 mb-4">What's the door charge right now?</p>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl text-gray-400 font-display">$</span>
              <input type="number" min="0" max="200" step="5" value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-quest-bg border border-quest-border rounded-lg px-4 py-2.5 font-display text-lg text-white outline-none focus:border-quest-gold-dim" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAmount(0)}
                className="flex-1 py-2 rounded-lg border border-green-800/50 text-green-400 font-display text-xs uppercase tracking-wider hover:bg-green-900/20 transition-colors">
                Free Tonight
              </button>
              <button onClick={submit}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-wider btn-press">
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Loyalty stamp mini-badge ──────────────────────────────────────────────────
function LoyaltyMini({ card }) {
  if (!card) return null
  const pct = Math.min(100, Math.round((card.stamps / card.stampsNeeded) * 100))
  return (
    <div className="flex items-center gap-1.5 bg-quest-bg border border-quest-border rounded-lg px-2 py-1">
      <Stamp size={9} className={card.isComplete ? 'text-quest-gold' : 'text-gray-600'} />
      <span className={`font-display text-[10px] font-bold ${card.isComplete ? 'text-quest-gold' : 'text-gray-500'}`}>
        {card.stamps}/{card.stampsNeeded}
      </span>
      {card.isComplete && <span className="text-[9px]">🎁</span>}
    </div>
  )
}

// ─── Venue Card ───────────────────────────────────────────────────────────────
function VenueCard({ venue, busyness, onAddToPlan, microReviews, loyalty }) {
  const [expanded, setExpanded] = useState(false)
  const [showCheckin, setShowCheckin] = useState(false)
  const [showCoverReport, setShowCoverReport] = useState(false)
  const open = isOpenNow(venue)

  // Micro-review helpers (safe if prop not provided)
  const venueTags     = microReviews?.getVenueTags(venue.id) ?? []
  const reviewCount   = microReviews?.getVenueReviewCount(venue.id) ?? 0
  const hasReviewed   = microReviews?.hasRecentlyReviewed(venue.id) ?? false
  const loyaltyCard   = loyalty?.getCard(venue.id) ?? null
  const happyHour = getCurrentHappyHour(venue)
  const todaySpecials = getTodaySpecials(venue)
  const { label: busyLabel, color: busyColor } = busynessLabel(busyness)

  const drinkRanges = ['', '$', '$$', '$$$', '$$$$']

  return (
    <>
      {showCheckin   && <CheckinModal    venue={venue} onClose={() => setShowCheckin(false)} />}
      {showCoverReport && <CoverReportModal venue={venue} onClose={() => setShowCoverReport(false)} />}

      <div className={`bg-quest-panel border rounded-xl overflow-hidden transition-all duration-200
        ${open ? 'border-quest-border' : 'border-gray-800/60 opacity-70'}`}>

        {/* Happy hour / specials banner */}
        {(happyHour || todaySpecials.length > 0) && open && (
          <div className="bg-gradient-to-r from-yellow-950/60 to-orange-950/40 border-b border-yellow-800/30 px-4 py-1.5 flex items-center gap-2">
            <Zap size={10} className="text-yellow-400 shrink-0" />
            {happyHour
              ? <span className="text-[11px] text-yellow-300 font-display font-semibold truncate">
                  Happy Hour until {happyHour.end} · {happyHour.deals[0]}
                </span>
              : <span className="text-[11px] text-orange-300 font-display font-semibold truncate">
                  {todaySpecials[0].name} — {todaySpecials[0].description.slice(0, 42)}…
                </span>
            }
          </div>
        )}

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-sm font-bold text-white leading-tight">{venue.name}</h3>
                <span className={`text-[9px] font-display uppercase tracking-widest px-1.5 py-0.5 rounded border
                  ${open ? 'bg-green-900/30 border-green-700/40 text-green-400' : 'bg-gray-900/40 border-gray-700/40 text-gray-500'}`}>
                  {open ? 'Open' : 'Closed'}
                </span>
                {venue.campusArea && (
                  <span className="text-[9px] font-display uppercase tracking-widest px-1.5 py-0.5 rounded border bg-blue-900/30 border-blue-700/40 text-blue-400 flex items-center gap-1">
                    <GraduationCap size={8} /> Campus
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] text-gray-500 font-body">{venue.type}</span>
                <span className="text-gray-700">·</span>
                <span className="text-[10px] text-gray-500">{venue.neighborhood}</span>
                <span className="text-gray-700">·</span>
                <span className="text-[10px] text-gray-500">{drinkRanges[venue.priceRange]}</span>
              </div>
            </div>
            {/* Star rating */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star size={10} className="text-quest-gold fill-quest-gold" />
                <span className="font-display text-xs font-bold text-gray-300">{venue.rating}</span>
              </div>
              <p className="text-[9px] text-gray-600">{venue.reviewCount} reviews</p>
            </div>
          </div>

          {/* Busyness meter */}
          <div className="mb-3">
            <BusynessMeter pct={busyness} />
          </div>

          {/* Micro-reviews */}
          {microReviews && (
            <div className="mb-3">
              <MicroReviewWidget
                venueId={venue.id}
                venueTags={venueTags}
                reviewCount={reviewCount}
                hasReviewed={hasReviewed}
                onSubmit={microReviews.submitReview}
                compact
              />
            </div>
          )}

          {/* Info chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <CoverBadge venue={venue} />
            {loyaltyCard && <LoyaltyMini card={loyaltyCard} />}
            <div className="flex items-center gap-1 bg-quest-bg border border-quest-border rounded-lg px-2 py-1">
              <Shield size={9} className="text-gray-500" />
              <span className="font-display text-[10px] text-gray-400 capitalize">{venue.dressCode.replace('-', ' ')}</span>
            </div>
            {venue.ageRequirement > 0 && (
              <div className="flex items-center gap-1 bg-quest-bg border border-quest-border rounded-lg px-2 py-1">
                <span className="font-display text-[10px] text-gray-400">{venue.ageRequirement}+</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-quest-bg border border-quest-border rounded-lg px-2 py-1">
              <Clock size={9} className="text-gray-500" />
              <span className="font-display text-[10px] text-gray-400">
                {venue.hours.open}–{venue.hours.close}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-quest-bg border border-quest-border rounded-lg px-2 py-1">
              <MapPin size={9} className="text-gray-500" />
              <span className="font-display text-[10px] text-gray-400">{venue.distanceMiles}mi · {venue.walkMinutes} min walk</span>
            </div>
          </div>

          {/* Expanded section */}
          {expanded && (
            <div className="space-y-3 mb-3 animate-fade-in">
              {/* Cover charge note */}
              {venue.coverCharge.note && (
                <div className="flex items-start gap-2 bg-quest-bg border border-quest-border rounded-lg p-2.5">
                  <AlertCircle size={11} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-400 font-body">{venue.coverCharge.note}</p>
                </div>
              )}
              {/* Amenities */}
              {venue.amenities.length > 0 && (
                <div>
                  <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities.map(a => (
                      <span key={a} className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-body">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Today's specials */}
              {todaySpecials.length > 0 && (
                <div>
                  <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">Tonight's Specials</p>
                  <div className="space-y-1.5">
                    {todaySpecials.map((s, i) => (
                      <div key={i} className="bg-yellow-950/30 border border-yellow-800/30 rounded-lg px-3 py-2">
                        <p className="font-display text-xs font-bold text-yellow-300">{s.name}</p>
                        <p className="font-body text-[11px] text-gray-400 mt-0.5">{s.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Happy hours */}
              {venue.happyHours.length > 0 && (
                <div>
                  <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-1.5">Happy Hours</p>
                  {venue.happyHours.map((hh, i) => (
                    <div key={i} className="bg-quest-bg border border-quest-border rounded-lg p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={10} className="text-quest-gold" />
                        <span className="font-display text-[10px] text-quest-gold font-bold">
                          {hh.start} – {hh.end}  ·  {hh.days.join(', ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {hh.deals.map((d, j) => (
                          <span key={j} className="text-[10px] text-green-400 bg-green-900/20 border border-green-800/30 px-2 py-0.5 rounded-full font-body">{d}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[10px] font-display uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors">
              {expanded ? <><ChevronUp size={11} /> Less</> : <><ChevronDown size={11} /> Details</>}
            </button>
            <div className="flex-1" />
            <button onClick={() => setShowCheckin(true)}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-quest-border text-[10px] font-display uppercase tracking-wider text-gray-400 hover:text-green-400 hover:border-green-800/60 transition-all btn-press">
              <Users size={10} /> Check In
            </button>
            <button onClick={() => setShowCoverReport(true)}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-quest-border text-[10px] font-display uppercase tracking-wider text-gray-400 hover:text-yellow-400 hover:border-yellow-800/60 transition-all btn-press">
              <DollarSign size={10} /> Cover
            </button>
            <button onClick={() => onAddToPlan(venue)}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg text-[10px] font-display font-bold uppercase tracking-wider transition-all btn-press shadow-sm">
              <Plus size={10} /> Plan
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Venue Feed (main export) ─────────────────────────────────────────────────
export default function VenueFeed({ onAddToPlan, microReviews, loyalty }) {
  const { status, locationLabel, requestLocation, setManualCity, resetLocation } = useLocation()
  const { customVenues, addVenue, removeVenue } = useCustomVenues()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const ALL_VENUES = useMemo(() => [...customVenues, ...VENUES], [customVenues])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [onlyHappyHour, setOnlyHappyHour] = useState(false)
  const [onlyCampus, setOnlyCampus] = useState(false)
  const [sortBy, setSortBy] = useState('distance') // distance | busyness | rating
  const [busynessMap, setBusynessMap] = useState(() => {
    const m = {}
    VENUES.forEach(v => {
      const checkin = getCheckinBusyness(v.id)
      m[v.id] = checkin !== null
        ? Math.round((checkin * 0.6 + computeBusyness(v) * 0.4))
        : computeBusyness(v)
    })
    return m
  })
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)

  // Live busyness refresh every 30s
  useEffect(() => {
    const t = setInterval(() => {
      setBusynessMap(prev => {
        const next = { ...prev }
        VENUES.forEach(v => {
          const checkin = getCheckinBusyness(v.id)
          next[v.id] = checkin !== null
            ? Math.round((checkin * 0.6 + computeBusyness(v) * 0.4))
            : computeBusyness(v)
        })
        return next
      })
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setBusynessMap(prev => {
        const next = { ...prev }
        VENUES.forEach(v => { next[v.id] = computeBusyness(v) })
        return next
      })
      setRefreshing(false)
    }, 600)
  }

  const handleAddToPlan = useCallback((venue) => {
    onAddToPlan(venue)
    setToast(`${venue.name} added to your plan!`)
    setTimeout(() => setToast(null), 2500)
  }, [onAddToPlan])

  const filtered = useMemo(() => {
    let list = ALL_VENUES
    if (search)        list = list.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.neighborhood.toLowerCase().includes(search.toLowerCase()) || v.tags.some(t => t.includes(search.toLowerCase())))
    if (typeFilter !== 'All') list = list.filter(v => v.type === typeFilter)
    if (onlyOpen)      list = list.filter(v => isOpenNow(v))
    if (onlyHappyHour) list = list.filter(v => getCurrentHappyHour(v) !== null)
    if (onlyCampus)    list = list.filter(v => v.campusArea || v.campusDistanceMiles <= 0.5)

    list = [...list].sort((a, b) => {
      if (sortBy === 'distance') return a.distanceMiles - b.distanceMiles
      if (sortBy === 'busyness') return (busynessMap[b.id] || 0) - (busynessMap[a.id] || 0)
      if (sortBy === 'rating')   return b.rating - a.rating
      return 0
    })
    return list
  }, [search, typeFilter, onlyOpen, onlyHappyHour, onlyCampus, sortBy, busynessMap, ALL_VENUES])

  const openCount = VENUES.filter(v => isOpenNow(v)).length
  const happyCount = VENUES.filter(v => getCurrentHappyHour(v)).length

  return (
    <div className="space-y-4 pb-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900 border border-green-700 text-green-300 font-display text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-lg animate-fade-in">
          ✓ {toast}
        </div>
      )}

      {/* ── Location gate — shown until location is known ─────────────────── */}
      {(status === 'unknown' || status === 'requesting' || status === 'denied') && (
        <LocationPrompt
          status={status}
          requestLocation={requestLocation}
          setManualCity={setManualCity}
          onDismiss={() => {}}
        />
      )}

      {/* ── Location context chip (once granted or manual) ─────────────────── */}
      {locationLabel && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-quest-border bg-quest-panel animate-fade-in">
          <Navigation size={11} className="text-purple-400 shrink-0" />
          <p className="font-body text-xs text-gray-400 flex-1">
            Showing venues near <span className="text-white font-semibold">{locationLabel}</span>
          </p>
          <button onClick={resetLocation}
            className="flex items-center gap-1 font-display text-[9px] uppercase tracking-widest text-gray-700 hover:text-gray-400 transition-colors">
            <RotateCcw size={9} /> Change
          </button>
        </div>
      )}

      {/* ── Sample Picks disclosure + add custom venue button ─────────── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-quest-border bg-quest-panel">
        <span className="text-base">🍸</span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[10px] uppercase tracking-wider text-quest-gold font-bold">
            Sample Picks · {VENUES.length} venues
          </p>
          <p className="font-body text-[10px] text-gray-600 mt-0.5 leading-tight">
            {customVenues.length > 0
              ? `+ ${customVenues.length} of your own — tap "Yours" to remove`
              : 'Curated examples. Add your own local spots below.'}
          </p>
        </div>
        <button onClick={() => setShowAddDialog(true)}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-display text-[10px] uppercase tracking-widest font-bold transition-all btn-press"
          style={{ background: 'rgba(240,192,96,0.12)', color: '#f0c060', border: '1px solid rgba(240,192,96,0.25)' }}>
          <Plus size={11} /> Add Venue
        </button>
      </div>

      {/* Search + refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search venues, areas, vibes…"
            className="w-full bg-quest-panel border border-quest-border rounded-xl pl-9 pr-4 py-2.5 font-body text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold-dim transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              <X size={12} />
            </button>
          )}
        </div>
        <button onClick={handleRefresh}
          className="w-10 h-10 flex items-center justify-center bg-quest-panel border border-quest-border rounded-xl text-gray-500 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Live stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: <CheckCircle size={11} className="text-green-400" />, value: openCount,   label: 'Open Now' },
          { icon: <Zap size={11}          className="text-yellow-400" />, value: happyCount, label: 'Happy Hour' },
          { icon: <GraduationCap size={11} className="text-blue-400" />, value: VENUES.filter(v => v.campusArea).length, label: 'Campus' },
        ].map(s => (
          <div key={s.label} className="bg-quest-panel border border-quest-border rounded-xl px-3 py-2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">{s.icon}<span className="font-display text-sm font-bold text-white">{s.value}</span></div>
            <span className="text-[9px] text-gray-600 uppercase tracking-wider font-display">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="space-y-2">
        {/* Type filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {VENUE_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full border font-display text-[10px] uppercase tracking-wider font-semibold transition-all btn-press
                ${typeFilter === t
                  ? 'bg-quest-gold text-quest-bg border-quest-gold shadow'
                  : 'bg-quest-panel border-quest-border text-gray-400 hover:border-gray-500'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Toggle filters */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'open',   label: 'Open Now',    active: onlyOpen,      set: setOnlyOpen,      icon: <Clock size={9} /> },
            { key: 'hh',     label: 'Happy Hour',  active: onlyHappyHour, set: setOnlyHappyHour, icon: <Zap size={9} />   },
            { key: 'campus', label: 'Campus Area',  active: onlyCampus,    set: setOnlyCampus,    icon: <GraduationCap size={9} /> },
          ].map(f => (
            <button key={f.key} onClick={() => f.set(v => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border font-display text-[10px] uppercase tracking-wider font-semibold transition-all btn-press
                ${f.active
                  ? 'bg-purple-900/60 border-purple-600 text-purple-200'
                  : 'bg-quest-panel border-quest-border text-gray-500 hover:border-gray-500'}`}>
              {f.icon}{f.label}
            </button>
          ))}

          {/* Sort */}
          <div className="flex items-center gap-1 ml-auto">
            <Filter size={9} className="text-gray-600" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-quest-panel border border-quest-border rounded-full text-[10px] font-display uppercase tracking-wider text-gray-400 px-2 py-1.5 outline-none cursor-pointer">
              <option value="distance">Distance</option>
              <option value="busyness">Busyness</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-quest-border" />
        <span className="text-[10px] font-display text-gray-600 uppercase tracking-wider">
          {filtered.length} venue{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="h-px flex-1 bg-quest-border" />
      </div>

      {/* Venue cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <Search size={28} className="text-gray-700 mx-auto mb-3" />
          <p className="font-display text-gray-600 text-xs uppercase tracking-wider">No venues match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(v => (
            <div key={v.id} className="relative">
              {v.custom && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                  <span className="font-display text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-quest-gold/20 text-quest-gold border border-quest-gold/30">
                    Yours
                  </span>
                  <button onClick={() => removeVenue(v.id)}
                    title="Remove this venue"
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-quest-bg border border-quest-border text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-colors">
                    <X size={9} />
                  </button>
                </div>
              )}
              <VenueCard venue={v} busyness={busynessMap[v.id] ?? 0} onAddToPlan={handleAddToPlan} microReviews={microReviews} loyalty={loyalty} />
            </div>
          ))}
        </div>
      )}

      {/* ── Add custom venue modal ─────────────────────────────────── */}
      {showAddDialog && (
        <AddVenueDialog
          onSave={(v) => { addVenue(v); setShowAddDialog(false) }}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  )
}

// ─── Add custom venue modal ───────────────────────────────────────────────────
function AddVenueDialog({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', type: 'Bar', neighborhood: '', notes: '' })
  const canSave = form.name.trim().length > 0
  const TYPES = VENUE_TYPES.filter(t => t !== 'All')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md bg-quest-panel border-t sm:border border-quest-border rounded-t-3xl sm:rounded-2xl p-5 space-y-4 animate-slide-up"
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-gray-500">Custom venue</p>
            <h3 className="font-display text-base font-black text-white">Add a Spot</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-quest-border text-gray-600 hover:text-gray-300 transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-1">
          <label className="font-display text-[10px] uppercase tracking-widest text-gray-600">Venue name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Lou's Tavern"
            autoFocus
            className="w-full bg-quest-bg border border-quest-border rounded-xl px-3 py-2.5 font-body text-sm text-white placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors" />
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label className="font-display text-[10px] uppercase tracking-widest text-gray-600">Type</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TYPES.map(t => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                className={`shrink-0 px-3 py-1.5 rounded-full border font-display text-[10px] uppercase tracking-wider font-bold transition-all btn-press ${
                  form.type === t
                    ? 'bg-quest-gold text-quest-bg border-quest-gold'
                    : 'bg-quest-bg border-quest-border text-gray-500'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Neighborhood */}
        <div className="space-y-1">
          <label className="font-display text-[10px] uppercase tracking-widest text-gray-600">Neighborhood</label>
          <input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })}
            placeholder="e.g. East Village"
            className="w-full bg-quest-bg border border-quest-border rounded-xl px-3 py-2.5 font-body text-sm text-white placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors" />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="font-display text-[10px] uppercase tracking-widest text-gray-600">Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Best happy hour, who runs it, anything memorable…"
            rows={2}
            className="w-full bg-quest-bg border border-quest-border rounded-xl px-3 py-2.5 font-body text-sm text-white placeholder-gray-700 outline-none focus:border-quest-gold-dim resize-none transition-colors" />
        </div>

        {/* Save */}
        <button onClick={() => canSave && onSave(form)}
          disabled={!canSave}
          className={`w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest transition-all btn-press ${
            canSave ? 'text-quest-bg' : 'text-gray-600 bg-quest-bg border border-quest-border cursor-not-allowed'
          }`}
          style={canSave ? { background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' } : {}}>
          Add to My List
        </button>
      </div>
    </div>
  )
}
