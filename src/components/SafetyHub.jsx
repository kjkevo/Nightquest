import { useState, useCallback } from 'react'
import {
  Heart, Phone, Plus, Trash2, ChevronDown, ChevronUp,
  MapPin, AlertTriangle, CheckCircle, Clock, Shield,
  X, Copy, Check, ExternalLink, Car, Navigation,
  UserPlus, Edit3, Bell, BellOff, Home, AlertCircle, Siren,
} from 'lucide-react'
import { useSafety } from '../hooks/useSafety'
import { useDesignatedDriver } from '../hooks/useDesignatedDriver'

// ─── Countdown ring ───────────────────────────────────────────────────────────
function CountdownRing({ totalSecs, remainingSecs, overdue, size = 96 }) {
  const r = (size / 2) - 7
  const circ = 2 * Math.PI * r
  const pct  = totalSecs > 0 ? Math.max(0, remainingSecs / totalSecs) : 0
  const offset = circ * (1 - pct)
  const color  = overdue ? '#ef4444' : pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f97316' : '#ef4444'

  const mins = Math.floor((remainingSecs || 0) / 60)
  const secs = (remainingSecs || 0) % 60

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e35" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={overdue ? 0 : offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
      </svg>
      <div className="absolute text-center">
        {overdue ? (
          <AlertTriangle size={24} className="text-red-400 mx-auto animate-pulse" />
        ) : (
          <>
            <div className="font-display text-lg font-black leading-none" style={{ color }}>
              {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
            </div>
            <div className="text-[9px] text-gray-600 font-display uppercase tracking-wider">left</div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Overdue alert banner ─────────────────────────────────────────────────────
function OverdueBanner({ onConfirm, onSendAlert }) {
  return (
    <div className="rounded-xl border-2 border-red-500 overflow-hidden animate-pulse-glow"
      style={{ background: 'rgba(239,68,68,0.12)', boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}>
      <div className="px-4 py-3 border-b border-red-900/60 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-400 animate-pulse shrink-0" />
        <p className="font-display text-sm font-bold text-red-300 uppercase tracking-wider">Check-in Overdue</p>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="font-body text-sm text-red-200">
          Your buddy check-in timer expired. Confirm you're safe or your contacts will be alerted.
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white transition-colors btn-press shadow-lg">
            <CheckCircle size={16} /> I'm OK!
          </button>
          <button onClick={onSendAlert}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest bg-red-700 hover:bg-red-600 text-white transition-colors btn-press">
            <Phone size={14} /> Alert Contacts
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── I Got Home hero button ───────────────────────────────────────────────────
function GotHomeButton({ onPress, gotHomeData }) {
  const [pressed, setPressed] = useState(false)

  const handle = () => {
    setPressed(true)
    onPress()
  }

  if (gotHomeData) {
    const time = new Date(gotHomeData.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return (
      <div className="rounded-2xl border border-green-700/60 p-5 text-center space-y-2"
        style={{ background: 'rgba(34,197,94,0.08)', boxShadow: '0 0 30px rgba(34,197,94,0.15)' }}>
        <div className="text-4xl">🏠</div>
        <p className="font-display text-lg font-bold text-green-400">Home Safe!</p>
        <p className="font-body text-sm text-gray-400">Confirmed at {time}</p>
        <p className="font-body text-xs text-gray-600">Your contacts and squad have been notified.</p>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div className={`absolute -inset-1 rounded-2xl blur-lg transition-all duration-300 ${pressed ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.5), rgba(240,192,96,0.3))' }} />
      <button
        onClick={handle}
        className="relative w-full flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-green-600/70 font-display transition-all btn-press"
        style={{ background: 'linear-gradient(135deg, #0f2019, #12121e)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-green-600/50"
          style={{ background: 'rgba(34,197,94,0.15)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
          🏠
        </div>
        <span className="text-xl font-black text-green-400 uppercase tracking-widest">I Got Home Safe</span>
        <span className="text-xs text-gray-500 font-body">Notifies your squad & trusted contacts</span>
      </button>
    </div>
  )
}

// ─── Alert contacts modal ─────────────────────────────────────────────────────
function AlertModal({ contacts, message, title, onClose, smsLink }) {
  const [sent, setSent] = useState({})
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(message).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(5,5,10,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-quest-border overflow-hidden animate-slide-up"
        style={{ background: '#12121e' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-quest-border">
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-quest-gold" />
            <span className="font-display text-sm font-bold text-gray-200 uppercase tracking-wider">{title}</span>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Message preview */}
          <div className="bg-quest-panel border border-quest-border rounded-xl p-3">
            <p className="text-[10px] text-gray-600 font-display uppercase tracking-wider mb-1.5">Message Preview</p>
            <p className="font-body text-sm text-gray-300 leading-relaxed">{message}</p>
          </div>

          {/* Per-contact SMS buttons */}
          {contacts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-600 font-display uppercase tracking-wider">Send To</p>
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-sm">
                      {c.emoji || '👤'}
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold text-gray-200">{c.name}</p>
                      <p className="text-[10px] text-gray-600">{c.phone || 'No number set'}</p>
                    </div>
                  </div>
                  {c.phone ? (
                    <a href={smsLink(c.phone, message)}
                      onClick={() => setSent(s => ({ ...s, [c.id]: true }))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-display text-[10px] uppercase tracking-wider transition-all btn-press border
                        ${sent[c.id]
                          ? 'border-green-700/40 bg-green-900/20 text-green-400'
                          : 'border-quest-border text-gray-400 hover:border-quest-gold-dim hover:text-quest-gold'}`}>
                      {sent[c.id] ? <><Check size={10} /> Sent</> : <><Phone size={10} /> SMS</>}
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-700 font-display">No number</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="font-body text-sm text-gray-500">No trusted contacts set up yet.</p>
            </div>
          )}

          {/* Copy fallback */}
          <button onClick={copy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors btn-press">
            {copied ? <><Check size={11} className="text-green-400" /> Copied!</> : <><Copy size={11} /> Copy Message</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Buddy check-in section ───────────────────────────────────────────────────
function CheckInSection({ safety }) {
  const { timer, timeRemaining, overdue, startTimer, confirmCheckIn, stopTimer, snoozeTimer } = safety
  const [showIntervals, setShowIntervals] = useState(false)
  const INTERVALS = [15, 30, 45, 60, 90]

  const totalSecs = timer.intervalMins * 60

  return (
    <div className="space-y-4">
      <div className="bg-quest-panel border border-quest-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={14} className="text-quest-gold" />
          <p className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider">Buddy Check-in Timer</p>
        </div>

        {!timer.active ? (
          <div className="space-y-3">
            <p className="font-body text-sm text-gray-500 leading-relaxed">
              Set a recurring timer. If you don't confirm you're safe before it expires, you'll be prompted to alert your trusted contacts.
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {INTERVALS.map(mins => (
                <button key={mins} onClick={() => startTimer(mins)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-quest-border font-display text-[10px] uppercase tracking-wider text-gray-400 hover:border-quest-gold-dim hover:text-quest-gold transition-all btn-press">
                  <span className="text-base font-black text-white">{mins}</span>
                  <span>min</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-700 font-body text-center">
              Tap an interval to start — you'll need to confirm check-ins on that schedule
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timer display */}
            <div className="flex items-center gap-5">
              <CountdownRing
                totalSecs={totalSecs}
                remainingSecs={timeRemaining ?? totalSecs}
                overdue={overdue}
                size={92}
              />
              <div className="flex-1">
                <p className="font-display text-xs text-gray-500 uppercase tracking-wider">Next check-in</p>
                <p className="font-display text-sm font-bold text-gray-200 mt-0.5">
                  Every {timer.intervalMins} min
                </p>
                {timer.missedCount > 0 && (
                  <p className="text-[10px] text-red-400 font-display uppercase tracking-wider mt-1">
                    ⚠ {timer.missedCount} missed
                  </p>
                )}
                <p className="text-[10px] text-gray-600 font-body mt-1">
                  {overdue ? 'Timer expired — please confirm!' : 'Tap "I\'m OK" before the timer runs out'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={confirmCheckIn}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-green-800 to-green-600 text-white hover:brightness-110 transition-all btn-press shadow-md">
                <CheckCircle size={15} /> I'm OK!
              </button>
              <button onClick={() => snoozeTimer(15)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-display text-xs uppercase tracking-widest border border-quest-border text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-all btn-press">
                <Clock size={13} /> +15 min
              </button>
            </div>

            {/* Stop */}
            <button onClick={stopTimer}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-display text-[10px] uppercase tracking-widest text-gray-700 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/40 btn-press">
              <BellOff size={10} /> Stop Timer
            </button>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-quest-panel/50 border border-quest-border/50 rounded-xl px-4 py-3 flex gap-3">
        <Shield size={13} className="text-purple-400 shrink-0 mt-0.5" />
        <p className="font-body text-xs text-gray-600 leading-relaxed">
          <span className="text-purple-300 font-semibold">How it works: </span>
          When the timer expires, you'll be prompted to confirm you're safe. If you don't respond, a one-tap alert to your trusted contacts opens automatically.
        </p>
      </div>
    </div>
  )
}

// ─── Trusted contacts section ─────────────────────────────────────────────────
const EMOJIS = ['👤','👩','👨','🧑','👧','🧔','👱','🧒']
function TrustedContactsSection({ safety }) {
  const { contacts, addContact, removeContact, updateContact, buildPlanSummary, buildGotHomeSMS, smsLink, location, refreshLocation } = safety
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', relationship: '', emoji: '👤' })
  const [modal, setModal] = useState(null) // { type: 'plan'|'location', msg }
  const [editing, setEditing] = useState(null)

  const submit = () => {
    if (!form.name.trim()) return
    if (editing) { updateContact(editing, form); setEditing(null) }
    else addContact(form)
    setForm({ name: '', phone: '', relationship: '', emoji: '👤' })
    setAdding(false)
  }

  const shareLocation = () => {
    refreshLocation()
    setTimeout(() => {
      const msg = safety.buildPlanSummary()
      setModal({ type: 'plan', msg })
    }, 1000)
  }

  return (
    <div className="space-y-3">
      {modal && (
        <AlertModal
          contacts={contacts}
          message={modal.msg}
          title={modal.type === 'plan' ? 'Share My Plan' : 'Share Location'}
          onClose={() => setModal(null)}
          smsLink={smsLink}
        />
      )}

      {contacts.length === 0 && !adding && (
        <div className="text-center py-6 bg-quest-panel border border-quest-border rounded-xl">
          <UserPlus size={28} className="text-gray-700 mx-auto mb-2" />
          <p className="font-display text-xs uppercase tracking-wider text-gray-600">No trusted contacts yet</p>
          <p className="font-body text-sm text-gray-700 mt-1">Add friends or family who'll watch out for you</p>
        </div>
      )}

      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="bg-quest-panel border border-quest-border rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-900/30 border border-purple-700/30 flex items-center justify-center text-lg shrink-0">
              {c.emoji || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs font-bold text-gray-200">{c.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {c.phone && <p className="text-[10px] text-gray-600 font-body">{c.phone}</p>}
                {c.relationship && <span className="text-[9px] text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded-full font-display uppercase tracking-wider">{c.relationship}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\D/g,'')}`}
                  className="w-7 h-7 rounded-lg border border-green-800/50 flex items-center justify-center text-green-500 hover:bg-green-900/20 transition-colors">
                  <Phone size={12} />
                </a>
              )}
              <button onClick={() => { setEditing(c.id); setForm({ name: c.name, phone: c.phone || '', relationship: c.relationship || '', emoji: c.emoji || '👤' }); setAdding(true) }}
                className="w-7 h-7 rounded-lg border border-quest-border flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors">
                <Edit3 size={11} />
              </button>
              <button onClick={() => removeContact(c.id)}
                className="w-7 h-7 rounded-lg border border-quest-border flex items-center justify-center text-gray-700 hover:text-red-400 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="bg-quest-bg border border-quest-border rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="font-display text-xs uppercase tracking-widest text-gray-500">{editing ? 'Edit Contact' : 'New Trusted Contact'}</p>

          {/* Emoji picker */}
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition-all btn-press
                  ${form.emoji === e ? 'border-quest-gold bg-quest-gold/15' : 'border-quest-border hover:border-gray-500'}`}>
                {e}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Name *"
              className="bg-quest-panel border border-quest-border rounded-lg px-3 py-2 font-body text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold-dim" />
            <input value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
              placeholder="Relationship"
              className="bg-quest-panel border border-quest-border rounded-lg px-3 py-2 font-body text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold-dim" />
          </div>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="Phone number (for SMS alerts)"
            type="tel"
            className="w-full bg-quest-panel border border-quest-border rounded-lg px-3 py-2 font-body text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold-dim" />
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setEditing(null); setForm({ name:'',phone:'',relationship:'',emoji:'👤' }) }}
              className="px-4 py-2 rounded-lg border border-quest-border text-gray-500 font-display text-xs uppercase tracking-wider btn-press">Cancel</button>
            <button onClick={submit}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-wider btn-press">
              {editing ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={() => { setAdding(true); setEditing(null) }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-quest-border text-gray-500 hover:border-quest-gold-dim hover:text-quest-gold font-display text-xs uppercase tracking-widest transition-all btn-press">
          <Plus size={13} /> Add Trusted Contact
        </button>
      )}

      {contacts.length > 0 && !adding && (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={shareLocation}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
            <Navigation size={12} /> Share Plan
          </button>
          <button onClick={() => setModal({ type: 'location', msg: safety.buildGotHomeSMS() })}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-900/50 font-display text-xs uppercase tracking-widest text-green-600 hover:text-green-400 hover:border-green-800/60 transition-all btn-press">
            <Home size={12} /> Send "Home Safe"
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Safe ride section ────────────────────────────────────────────────────────
function SafeRideSection({ safety }) {
  const { location, refreshLocation, getRideUrl } = safety
  const [locLoading, setLocLoading] = useState(false)

  const handleLocate = () => {
    setLocLoading(true)
    refreshLocation()
    setTimeout(() => setLocLoading(false), 3000)
  }

  const RIDES = [
    { id: 'uber',  name: 'Uber',   emoji: '⚫', bg: 'rgba(0,0,0,0.6)',    border: '#333',    text: '#fff',     desc: 'Opens Uber with your location' },
    { id: 'lyft',  name: 'Lyft',   emoji: '🩷', bg: 'rgba(234,11,140,0.15)', border: '#7d0058', text: '#ff69b4', desc: 'Opens Lyft with your location' },
    { id: 'waymo', name: 'Waymo',  emoji: '🤖', bg: 'rgba(59,130,246,0.12)', border: '#1d4ed8', text: '#93c5fd', desc: 'Self-driving (select markets)' },
  ]

  return (
    <div className="space-y-4">
      {/* Location status */}
      <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${location ? 'border-green-700/50 bg-green-900/10' : 'border-quest-border bg-quest-panel'}`}>
        <div className="flex items-center gap-2">
          <MapPin size={13} className={location ? 'text-green-400' : 'text-gray-600'} />
          <div>
            <p className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider">
              {location ? 'Location Ready' : 'Location Not Set'}
            </p>
            <p className="text-[10px] text-gray-600 font-body mt-0.5">
              {location
                ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} — Pre-fills pickup automatically`
                : 'Allow location for pre-filled pickup address'}
            </p>
          </div>
        </div>
        <button onClick={handleLocate}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-quest-border font-display text-[10px] uppercase tracking-wider text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          <Navigation size={10} className={locLoading ? 'animate-spin' : ''} />
          {location ? 'Refresh' : 'Get Location'}
        </button>
      </div>

      {/* Ride buttons */}
      <div className="space-y-2">
        {RIDES.map(r => (
          <a key={r.id}
            href={getRideUrl(r.id)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-4 rounded-xl border transition-all btn-press group"
            style={{ background: r.bg, borderColor: r.border }}>
            <span className="text-2xl shrink-0">{r.emoji}</span>
            <div className="flex-1">
              <p className="font-display text-sm font-bold" style={{ color: r.text }}>{r.name}</p>
              <p className="text-[10px] text-gray-600 font-body mt-0.5">{r.desc}</p>
            </div>
            <ExternalLink size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
          </a>
        ))}
      </div>

      {/* Safety tip */}
      <div className="bg-quest-panel/50 border border-quest-border/50 rounded-xl px-4 py-3 flex gap-3">
        <Car size={13} className="text-cyan-400 shrink-0 mt-0.5" />
        <p className="font-body text-xs text-gray-600 leading-relaxed">
          <span className="text-cyan-300 font-semibold">Safety tip: </span>
          Always verify the driver's name, plate, and photo before getting in. Share your trip details with a trusted contact.
        </p>
      </div>
    </div>
  )
}

// ─── Campus safety numbers ────────────────────────────────────────────────────
function CampusSafetySection({ safety }) {
  const { campusNums, updateCampusNum } = safety
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(null)

  const saveNum = (id) => {
    updateCampusNum(id, draft)
    setSaved(id)
    setEditing(null)
    setTimeout(() => setSaved(null), 2000)
  }

  const categoryOrder = ['emergency', 'crisis', 'health', 'campus']
  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = campusNums.filter(n => n.category === cat)
    return acc
  }, {})

  const categoryLabels = { emergency: '🚨 Emergency', crisis: '💜 Crisis Support', health: '🏥 Health', campus: '🎓 Campus Services' }

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-gray-500 leading-relaxed">
        Fill in your campus-specific numbers below. Emergency and crisis lines are pre-populated.
      </p>

      {Object.entries(grouped).map(([cat, nums]) => (
        nums.length > 0 && (
          <div key={cat} className="space-y-1.5">
            <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 px-1">{categoryLabels[cat]}</p>
            {nums.map(num => (
              <div key={num.id} className="bg-quest-panel border border-quest-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl shrink-0">{num.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs font-bold text-gray-200">{num.name}</p>
                    {num.description && <p className="text-[10px] text-gray-600 font-body mt-0.5">{num.description}</p>}

                    {/* Number display / edit */}
                    {editing === num.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          autoFocus
                          value={draft}
                          onChange={e => setDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveNum(num.id); if (e.key === 'Escape') setEditing(null) }}
                          placeholder={num.placeholder}
                          type="tel"
                          className="flex-1 bg-quest-bg border border-quest-gold-dim/60 rounded-lg px-2 py-1 font-display text-xs text-quest-gold outline-none focus:border-quest-gold" />
                        <button onClick={() => saveNum(num.id)}
                          className="px-2 py-1 rounded-lg bg-quest-gold text-quest-bg font-display text-[10px] uppercase tracking-wider btn-press">Save</button>
                        <button onClick={() => setEditing(null)}
                          className="text-gray-600 hover:text-gray-400"><X size={12} /></button>
                      </div>
                    ) : (
                      num.number ? (
                        <p className="font-display text-sm font-bold text-quest-gold mt-0.5">
                          {num.isText ? `Text: ${num.number}` : num.number}
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-700 font-body italic mt-0.5">{num.placeholder}</p>
                      )
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {saved === num.id ? (
                      <Check size={14} className="text-green-400" />
                    ) : num.number && !num.isText ? (
                      <a href={`tel:${num.number.replace(/\D/g,'')}`}
                        className="w-9 h-9 rounded-xl bg-green-900/30 border border-green-700/40 flex items-center justify-center text-green-400 hover:bg-green-900/50 transition-colors btn-press">
                        <Phone size={14} />
                      </a>
                    ) : num.number && num.isText ? (
                      <a href={`sms:${num.number}`}
                        className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center text-purple-400 hover:bg-purple-900/50 transition-colors btn-press">
                        <Phone size={14} />
                      </a>
                    ) : null}

                    {num.editable && editing !== num.id && (
                      <button onClick={() => { setEditing(num.id); setDraft(num.number || '') }}
                        className="w-9 h-9 rounded-xl border border-quest-border flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors btn-press">
                        <Edit3 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  )
}

// ─── Sub-tab nav ──────────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'checkin',   label: 'Check-in',  emoji: '⏱' },
  { id: 'contacts',  label: 'Contacts',  emoji: '👥' },
  { id: 'ride',      label: 'Safe Ride', emoji: '🚗' },
  { id: 'campus',    label: 'Campus',    emoji: '🎓' },
]

// ─── SOS Hero — one-tap emergency contact alert ──────────────────────────────
function SOSHero({ safety }) {
  const [pressing, setPressing] = useState(false)
  const [armed, setArmed]       = useState(false)
  const [sent, setSent]         = useState(false)
  const primary = safety.contacts?.[0]

  const sosBody = `🚨 SOS from NightQuest — I need help. ` +
    (safety.location
      ? `My location: https://maps.google.com/?q=${safety.location.lat},${safety.location.lng}`
      : `(Location not shared yet — please call or text me.)`)

  const send = () => {
    if (!primary) return
    const url = safety.smsLink(primary.number, sosBody)
    if (url) window.location.href = url
    setSent(true)
    setTimeout(() => { setSent(false); setArmed(false) }, 5000)
  }

  // No contacts saved → prompt to add
  if (!primary) {
    return (
      <div className="rounded-2xl border border-red-900/40 px-4 py-4 flex items-center gap-3"
        style={{ background: 'rgba(239,68,68,0.06)' }}>
        <div className="w-11 h-11 rounded-xl bg-red-900/40 border border-red-800/50 flex items-center justify-center shrink-0">
          <Siren size={20} className="text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm font-black text-red-300 uppercase tracking-wider">One-Tap SOS</p>
          <p className="font-body text-xs text-gray-500 mt-0.5 leading-relaxed">
            Add a trusted contact below so SOS can text them instantly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.06)', boxShadow: '0 0 30px rgba(239,68,68,0.12)' }}>
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,transparent,#ef4444,transparent)' }} />
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-900/40 border border-red-800/50 flex items-center justify-center shrink-0">
            <Siren size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-black text-red-300 uppercase tracking-wider">One-Tap SOS</p>
            <p className="font-body text-xs text-gray-500 mt-0.5 leading-relaxed">
              Texts <span className="text-white font-bold">{primary.name}</span> with your location.
            </p>
          </div>
        </div>

        {!armed ? (
          <button
            onMouseDown={() => setPressing(true)}
            onMouseUp={() => setPressing(false)}
            onMouseLeave={() => setPressing(false)}
            onClick={() => setArmed(true)}
            className={`w-full py-4 rounded-xl font-display text-base font-black uppercase tracking-widest text-white btn-press transition-all ${
              pressing ? 'scale-[0.98] brightness-110' : ''
            }`}
            style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 0 24px rgba(239,68,68,0.4)' }}>
            🚨 SOS
          </button>
        ) : sent ? (
          <div className="rounded-xl border border-green-700/50 px-4 py-3 flex items-center justify-center gap-2"
            style={{ background: 'rgba(34,197,94,0.08)' }}>
            <CheckCircle size={14} className="text-green-400" />
            <p className="font-display text-xs font-bold text-green-300 uppercase tracking-widest">SOS sent to {primary.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-display text-[10px] uppercase tracking-widest text-red-300 text-center">Confirm to send</p>
            <div className="flex gap-2">
              <button onClick={() => setArmed(false)}
                className="flex-1 py-2.5 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={send}
                className="flex-1 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-widest text-white btn-press transition-all"
                style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
                Send SOS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Designated Driver — squad-local DD indicator ─────────────────────────────
function DesignatedDriverCard({ dd, setDD, clearDD }) {
  const [draft, setDraft]       = useState('')
  const [editing, setEditing]   = useState(false)

  if (dd?.name && !editing) {
    return (
      <div className="rounded-xl border border-blue-900/40 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(59,130,246,0.06)' }}>
        <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-700/40 flex items-center justify-center shrink-0">
          <Car size={16} className="text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[10px] uppercase tracking-widest text-blue-300 font-bold">Tonight's Designated Driver</p>
          <p className="font-display text-base font-black text-white truncate">🛡 {dd.name}</p>
        </div>
        <button onClick={() => { setDraft(dd.name); setEditing(true) }}
          className="font-display text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">
          Change
        </button>
        <button onClick={clearDD}
          title="Clear DD"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-quest-border text-gray-600 hover:text-red-400 transition-colors">
          <X size={11} />
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-quest-border bg-quest-panel px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <Car size={14} className="text-blue-400" />
        <p className="font-display text-xs font-bold text-blue-300 uppercase tracking-wider">Designated Driver</p>
      </div>
      <p className="font-body text-[11px] text-gray-500 leading-relaxed">
        Who's staying sober and driving everyone home tonight?
      </p>
      <div className="flex gap-2">
        <input value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && draft.trim() && (setDD(draft), setEditing(false))}
          placeholder="Driver's name…"
          maxLength={30}
          className="flex-1 bg-quest-bg border border-quest-border rounded-lg px-3 py-2 font-body text-sm text-white placeholder-gray-700 outline-none focus:border-blue-700 transition-colors" />
        <button onClick={() => draft.trim() && (setDD(draft), setEditing(false))}
          disabled={!draft.trim()}
          className={`px-4 rounded-lg font-display text-xs font-bold uppercase tracking-wider transition-all btn-press ${
            draft.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-quest-bg text-gray-600 border border-quest-border cursor-not-allowed'
          }`}>
          Set
        </button>
      </div>
    </div>
  )
}

// ─── Main SafetyHub ───────────────────────────────────────────────────────────
export default function SafetyHub({ squadBroadcast }) {
  const safety = useSafety()
  const { dd, setDD, clearDD } = useDesignatedDriver()
  const [activeTab, setActiveTab] = useState('checkin')
  const [gotHomeModal, setGotHomeModal] = useState(false)

  const handleGotHome = () => {
    const data = safety.confirmGotHome()
    setGotHomeModal(true)
    // Also broadcast to squad
    squadBroadcast?.('home_safe')
  }

  return (
    <div className="space-y-4 pb-2">
      {/* Overdue alert — always at top */}
      {safety.overdue && (
        <OverdueBanner
          onConfirm={safety.confirmCheckIn}
          onSendAlert={() => setActiveTab('contacts')}
        />
      )}

      {/* I Got Home hero */}
      {!safety.gotHomeData ? (
        <GotHomeButton onPress={handleGotHome} gotHomeData={null} />
      ) : (
        <GotHomeButton onPress={() => {}} gotHomeData={safety.gotHomeData} />
      )}

      {/* Got-home alert modal */}
      {gotHomeModal && (
        <AlertModal
          contacts={safety.contacts}
          message={safety.buildGotHomeSMS()}
          title="Notify Contacts"
          onClose={() => setGotHomeModal(false)}
          smsLink={safety.smsLink}
        />
      )}

      {/* Clear got-home (start fresh) */}
      {safety.gotHomeData && (
        <button onClick={safety.clearGotHome}
          className="w-full text-[10px] text-gray-700 hover:text-gray-500 font-display uppercase tracking-wider transition-colors btn-press">
          Start a new night →
        </button>
      )}

      {/* One-tap SOS hero */}
      <SOSHero safety={safety} />

      {/* Designated Driver indicator */}
      <DesignatedDriverCard dd={dd} setDD={setDD} clearDD={clearDD} />

      {/* Sub-tab nav */}
      <div className="grid grid-cols-4 gap-1 bg-quest-panel border border-quest-border rounded-xl p-1">
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2 rounded-lg font-display text-[9px] uppercase tracking-wider font-bold transition-all btn-press
              ${activeTab === t.id
                ? 'bg-quest-gold/20 border border-quest-gold/30 text-quest-gold'
                : 'text-gray-600 hover:text-gray-400'}`}>
            <span className="text-base leading-none">{t.emoji}</span>
            <span className="leading-tight">{t.label}</span>
            {t.id === 'checkin' && safety.timer.active && (
              <span className={`w-1.5 h-1.5 rounded-full ${safety.overdue ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'checkin'  && <CheckInSection safety={safety} />}
      {activeTab === 'contacts' && <TrustedContactsSection safety={safety} />}
      {activeTab === 'ride'     && <SafeRideSection safety={safety} />}
      {activeTab === 'campus'   && <CampusSafetySection safety={safety} />}
    </div>
  )
}
