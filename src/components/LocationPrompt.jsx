/**
 * LocationPrompt — handles the full location permission UX:
 *   • 'unknown'    → permission request card with explanation + fallback link
 *   • 'requesting' → loading spinner
 *   • 'denied'     → friendly error + manual input
 *   • 'manual'     → (handled by parent; prompt doesn't render)
 *   • 'granted'    → (handled by parent; prompt doesn't render)
 *
 * Props:
 *   status          — from useLocation()
 *   requestLocation — fn
 *   setManualCity   — fn(city: string)
 *   onDismiss       — fn called after manual city is saved
 */

import { useState } from 'react'
import { MapPin, Navigation, X, AlertCircle, Loader, ChevronRight } from 'lucide-react'

// ─── Manual city / postcode input ─────────────────────────────────────────────
function ManualInput({ onSave, onBack }) {
  const [value, setValue] = useState('')
  const [error, setError]  = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) { setError('Please enter a city or postcode.'); return }
    onSave(trimmed)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-quest-border text-gray-600 hover:text-gray-300 transition-colors shrink-0">
            <X size={13} />
          </button>
        )}
        <p className="font-display text-sm font-bold text-white">Enter your location</p>
      </div>

      <div className="space-y-2">
        <p className="font-body text-xs text-gray-500 leading-relaxed">
          Type your city, neighbourhood, or postcode so we can show venues near you.
        </p>
        <div className="relative">
          <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          <input
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Brooklyn, NY · E1 6RF · Chicago"
            autoFocus
            className="w-full bg-quest-bg border border-quest-border rounded-xl pl-9 pr-3 py-3 font-body text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors"
          />
        </div>
        {error && <p className="font-body text-xs text-red-400">{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className={`w-full py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest transition-all btn-press ${
          value.trim()
            ? 'text-quest-bg'
            : 'text-gray-600 bg-quest-panel border border-quest-border cursor-not-allowed'
        }`}
        style={value.trim() ? { background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' } : {}}>
        Use This Location
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LocationPrompt({ status, requestLocation, setManualCity, onDismiss }) {
  const [showManual, setShowManual] = useState(status === 'denied')

  const handleManualSave = (city) => {
    setManualCity(city)
    onDismiss?.()
  }

  // ── Requesting ──────────────────────────────────────────────────────────────
  if (status === 'requesting') {
    return (
      <div className="rounded-2xl border border-quest-border bg-quest-panel px-5 py-8 text-center space-y-3 animate-fade-in">
        <Loader size={28} className="text-quest-gold mx-auto animate-spin" />
        <p className="font-display text-sm font-bold text-white">Checking your location…</p>
        <p className="font-body text-xs text-gray-500">Allow the browser prompt to share your approximate position.</p>
      </div>
    )
  }

  // ── Denied (switch straight to manual) ─────────────────────────────────────
  if (status === 'denied' || showManual) {
    return (
      <div className="rounded-2xl border border-quest-border bg-quest-panel px-5 py-6 space-y-4 animate-fade-in">
        {status === 'denied' && !showManual && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="font-body text-xs text-red-300 leading-relaxed">
              Location access was denied. You can still use Explore by entering your location below.
            </p>
          </div>
        )}
        <ManualInput
          onSave={handleManualSave}
          onBack={null}
        />
      </div>
    )
  }

  // ── Unknown — main permission request ──────────────────────────────────────
  if (showManual) {
    return (
      <div className="rounded-2xl border border-quest-border bg-quest-panel px-5 py-6 space-y-4 animate-fade-in">
        <ManualInput
          onSave={handleManualSave}
          onBack={() => setShowManual(false)}
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-quest-border bg-quest-panel overflow-hidden animate-fade-in"
      style={{ boxShadow: '0 0 40px rgba(124,58,237,0.08)' }}>

      {/* Purple gradient top stripe */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)' }} />

      <div className="px-5 py-6 space-y-5">
        {/* Icon + heading */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Navigation size={22} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-display text-base font-black text-white">Find Venues Near You</h2>
            <p className="font-body text-xs text-gray-500 mt-0.5 leading-relaxed">
              Share your approximate location to sort venues by walking distance and see what's close right now.
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <MapPin size={13} className="text-green-400 shrink-0 mt-0.5" />
          <p className="font-body text-xs text-gray-400 leading-relaxed">
            <span className="text-green-400 font-semibold">Your location is never stored or shared.</span>
            {' '}It's used only on this device to sort and filter venues — it leaves when you close the tab.
          </p>
        </div>

        {/* What you get */}
        <div className="space-y-2">
          {[
            { icon: '📍', text: 'Walking distance and time to each venue' },
            { icon: '🔍', text: 'Sort results closest first' },
            { icon: '🎯', text: 'Filter for venues on your campus route' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="text-sm shrink-0">{icon}</span>
              <p className="font-body text-xs text-gray-400">{text}</p>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          onClick={requestLocation}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-display text-sm font-bold uppercase tracking-widest text-white transition-all btn-press hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
          <Navigation size={14} /> Allow Location Access
        </button>

        {/* Manual fallback */}
        <button
          onClick={() => setShowManual(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 font-display text-xs uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
          <ChevronRight size={11} /> Enter my city or postcode instead
        </button>
      </div>
    </div>
  )
}
