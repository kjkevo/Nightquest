import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Plus, Trash2, ChevronUp, ChevronDown, Calendar,
  Share2, RotateCcw, MapPin, Clock, Car, CheckCircle,
  ChevronRight, Copy, Download,
} from 'lucide-react'
import {
  usePlanner, SLOT_TYPES, buildPlanUrl,
  parseTime, formatTime12, formatDuration, computeStopDuration,
  getPlanParam, clearPlanParam,
} from '../hooks/usePlanner'

// ─── Travel time connector between two slots ──────────────────────────────────
function TravelConnector({ travelMins, color, onChange, isLast }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(String(travelMins ?? 15))
  const inputRef = useRef(null)

  if (isLast) return <div className="w-0.5 h-4 mx-auto" style={{ background: `${color}30` }} />

  const commit = () => {
    const v = parseInt(draft)
    if (!isNaN(v) && v >= 0) onChange(v)
    else setDraft(String(travelMins ?? 15))
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 py-1 px-2 justify-center">
      {/* Vertical line segment */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-0.5 h-3" style={{ background: `${color}40` }} />
        <Car size={10} style={{ color: `${color}80` }} />
        <div className="w-0.5 h-3" style={{ background: `${color}40` }} />
      </div>

      {editing ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="number"
            min={0} max={120}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            autoFocus
            className="w-14 bg-quest-bg border border-quest-gold-dim rounded px-2 py-0.5 font-display text-xs text-quest-gold outline-none text-center tabular-nums"
          />
          <span className="font-display text-[9px] text-gray-600 uppercase">min</span>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(String(travelMins ?? 15)); setEditing(true) }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full font-display text-[9px] uppercase tracking-wider text-gray-600 hover:text-gray-300 transition-colors"
          title="Tap to edit travel time">
          <span className="tabular-nums">{travelMins ?? 15}</span> min travel
        </button>
      )}
    </div>
  )
}

// ─── Single stop card ─────────────────────────────────────────────────────────
function SlotCard({ slot, nextSlot, isFirst, isLast, onChange, onRemove, onMoveUp, onMoveDown, onAddAfter }) {
  const [notesOpen, setNotesOpen] = useState(!!slot.notes)
  const typeConfig = SLOT_TYPES.find(t => t.id === slot.type) || SLOT_TYPES[0]

  const stopDuration = computeStopDuration(slot, nextSlot)
  const startTime12  = formatTime12(parseTime(slot.time))

  return (
    <div className="relative">
      <div className="rounded-2xl border overflow-hidden transition-all"
        style={{ borderColor: `${typeConfig.color}33`, background: `${typeConfig.color}07` }}>

        {/* Coloured left stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: typeConfig.color }} />

        <div className="pl-4 pr-3 pt-2.5 pb-2 space-y-2">
          {/* Row 1 — type selector + time + duration + controls */}
          <div className="flex items-center gap-2">
            {/* Emoji + type */}
            <span className="text-base shrink-0">{typeConfig.emoji}</span>
            <select value={slot.type} onChange={e => onChange('type', e.target.value)}
              className="bg-transparent border-none font-display text-[10px] uppercase tracking-widest outline-none cursor-pointer shrink-0"
              style={{ color: typeConfig.color }}>
              {SLOT_TYPES.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#12121e', color: t.color }}>{t.label}</option>
              ))}
            </select>

            {stopDuration && (
              <span className="font-display text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                style={{ color: typeConfig.color, background: `${typeConfig.color}18` }}>
                {formatDuration(stopDuration)}
              </span>
            )}

            <div className="flex-1" />

            {/* Reorder + delete */}
            <div className="flex items-center gap-0.5">
              <button disabled={isFirst} onClick={onMoveUp}
                className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-300 disabled:opacity-20 transition-colors">
                <ChevronUp size={11} />
              </button>
              <button disabled={isLast} onClick={onMoveDown}
                className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-300 disabled:opacity-20 transition-colors">
                <ChevronDown size={11} />
              </button>
              <button onClick={onRemove}
                className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-red-400 transition-colors">
                <Trash2 size={10} />
              </button>
            </div>
          </div>

          {/* Row 2 — time picker + venue name */}
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <Clock size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              <input type="time" value={slot.time}
                onChange={e => onChange('time', e.target.value)}
                className="bg-quest-bg border border-quest-border rounded-xl pl-6 pr-2 py-1.5 font-display text-xs text-gray-200 outline-none focus:border-quest-gold-dim w-[105px] transition-colors" />
            </div>
            <div className="relative flex-1">
              <MapPin size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              <input value={slot.venueName}
                onChange={e => onChange('venueName', e.target.value)}
                placeholder="Venue name…"
                className="w-full bg-quest-bg border border-quest-border rounded-xl pl-7 pr-3 py-1.5 font-body text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors" />
            </div>
          </div>

          {/* Notes toggle */}
          <div>
            <button onClick={() => setNotesOpen(o => !o)}
              className="flex items-center gap-1 text-[10px] font-display uppercase tracking-wider text-gray-700 hover:text-gray-400 transition-colors">
              <ChevronRight size={9} className={`transition-transform ${notesOpen ? 'rotate-90' : ''}`} />
              {notesOpen ? 'Hide note' : slot.notes ? `📝 ${slot.notes.slice(0, 30)}` : 'Add note / reminder'}
            </button>
            {notesOpen && (
              <textarea
                value={slot.notes}
                onChange={e => onChange('notes', e.target.value)}
                placeholder="Cover charge, address, who's coming…"
                rows={2}
                className="w-full mt-1.5 bg-quest-bg border border-quest-border rounded-xl px-3 py-2 font-body text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-quest-gold-dim resize-none transition-colors animate-fade-in" />
            )}
          </div>

          {/* Insert below */}
          <button onClick={onAddAfter}
            className="flex items-center gap-1 text-[10px] text-gray-700 hover:text-gray-400 font-display uppercase tracking-wider transition-colors">
            <Plus size={9} /> Insert stop below
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Read-only preview (from shared link) ─────────────────────────────────────
function PlanPreview({ slots, onImport, onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0"
      style={{ background: 'rgba(5,5,10,0.88)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg bg-quest-panel border-t border-quest-border rounded-t-3xl pb-safe animate-slide-up max-h-[80vh] flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-quest-border shrink-0">
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-base font-black text-white">Shared Night Plan</h2>
          <p className="font-body text-xs text-gray-500 mt-0.5">Someone sent you their plan for tonight</p>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
          {slots.map((slot, i) => {
            const typeConfig = SLOT_TYPES.find(t => t.id === slot.type) || SLOT_TYPES[0]
            const nextSlot   = slots[i + 1]
            const dur        = computeStopDuration(slot, nextSlot)
            const t12        = formatTime12(parseTime(slot.time))
            return (
              <div key={slot.id}>
                <div className="flex items-start gap-3 py-2 px-3 rounded-xl"
                  style={{ background: `${typeConfig.color}0a`, border: `1px solid ${typeConfig.color}25` }}>
                  <span className="text-xl shrink-0 mt-0.5">{typeConfig.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t12 && <span className="font-display text-xs font-bold text-white">{t12}</span>}
                      <span className="font-display text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ color: typeConfig.color, background: `${typeConfig.color}20` }}>
                        {typeConfig.label}
                      </span>
                      {dur && <span className="font-display text-[9px] text-gray-600">{formatDuration(dur)}</span>}
                    </div>
                    {slot.venueName && <p className="font-body text-sm text-gray-300 mt-0.5">{slot.venueName}</p>}
                    {slot.notes     && <p className="font-body text-xs text-gray-600 mt-0.5 italic">{slot.notes}</p>}
                  </div>
                </div>
                {nextSlot && slot.travelMinsAfter > 0 && (
                  <div className="flex items-center justify-center gap-1 py-1 text-gray-700">
                    <Car size={9} />
                    <span className="font-display text-[9px]">{slot.travelMinsAfter} min</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-quest-border space-y-2 shrink-0">
          <button onClick={onImport}
            className="w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest text-quest-bg btn-press transition-all"
            style={{ background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' }}>
            <Download size={14} className="inline mr-2" /> Save to My Plan
          </button>
          <button onClick={onDismiss}
            className="w-full py-2 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Night summary strip ──────────────────────────────────────────────────────
function NightSummary({ slots }) {
  const timed = slots.filter(s => s.time)
  if (timed.length < 2) return null
  const first = parseTime(timed[0].time)
  const last  = parseTime(timed[timed.length - 1].time)
  if (first == null || last == null) return null
  let totalMins = last - first
  if (totalMins < 0) totalMins += 1440
  const totalTravel = slots.reduce((s, sl) => s + (sl.travelMinsAfter ?? 0), 0)
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-quest-panel border border-quest-border">
      <Clock size={12} className="text-gray-600 shrink-0" />
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <span className="font-display text-[10px] uppercase tracking-wider text-gray-500">
          {formatTime12(first)} → {formatTime12(last)}
        </span>
        <span className="text-gray-700">·</span>
        <span className="font-display text-[10px] uppercase tracking-wider text-gray-500">
          {formatDuration(totalMins)} total
        </span>
        {totalTravel > 0 && (
          <>
            <span className="text-gray-700">·</span>
            <span className="font-display text-[10px] uppercase tracking-wider text-gray-600">
              {formatDuration(totalTravel)} travel
            </span>
          </>
        )}
      </div>
      <span className="font-display text-xs font-black text-quest-gold shrink-0">{slots.length} stops</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NightPlanner({ pendingVenue, onPendingConsumed }) {
  const { slots, addSlot, removeSlot, updateSlot, moveSlot, addVenueSlot, importSlots, clearPlan } = usePlanner()
  const [shareState,       setShareState]       = useState('idle') // 'idle'|'copied'|'shared'
  const [showClear,        setShowClear]        = useState(false)
  const [incomingPlan,     setIncomingPlan]     = useState(() => getPlanParam())

  const processedVenueRef = useRef(null)

  // Consume venue from Explore tab
  useEffect(() => {
    if (pendingVenue && pendingVenue !== processedVenueRef.current) {
      processedVenueRef.current = pendingVenue
      addVenueSlot(pendingVenue)
      onPendingConsumed?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingVenue])

  const handleShare = async () => {
    const url = buildPlanUrl(slots)
    if (!url) return
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Night Plan — NightQuest", text: "Here's my plan for tonight:", url })
        setShareState('shared')
        setTimeout(() => setShareState('idle'), 2500)
        return
      } catch (e) { if (e?.name === 'AbortError') return }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2500)
    } catch { window.prompt('Copy this plan link:', url) }
  }

  const handleImport = () => {
    if (incomingPlan) {
      importSlots(incomingPlan)
      clearPlanParam()
      setIncomingPlan(null)
    }
  }

  const filled  = slots.filter(s => s.venueName).length
  const now     = new Date()
  const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()]
  const month   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]
  const dateStr = `${dayName} ${month} ${now.getDate()}`

  return (
    <div className="space-y-4 pb-4">

      {/* Incoming plan from shared link */}
      {incomingPlan && (
        <PlanPreview
          slots={incomingPlan}
          onImport={handleImport}
          onDismiss={() => { clearPlanParam(); setIncomingPlan(null) }}
        />
      )}

      {/* Header card */}
      <div className="bg-quest-panel border border-quest-border rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="font-display text-[10px] text-gray-500 uppercase tracking-widest">Tonight's Plan</p>
              <p className="font-display text-sm font-bold text-white">{dateStr}</p>
            </div>
          </div>
          {/* Share button */}
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all btn-press"
            style={{
              background: shareState !== 'idle' ? 'rgba(34,197,94,0.12)' : 'rgba(240,192,96,0.10)',
              color:       shareState !== 'idle' ? '#4ade80' : '#f0c060',
              border:      shareState !== 'idle' ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(240,192,96,0.25)',
            }}>
            {shareState === 'idle'   && <><Share2 size={12} /> Share</>}
            {shareState === 'copied' && <><CheckCircle size={12} /> Copied!</>}
            {shareState === 'shared' && <><CheckCircle size={12} /> Shared!</>}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: slots.length ? `${(filled / slots.length) * 100}%` : '0%',
              background: 'linear-gradient(90deg,#7c3aed,#f0c060)',
              boxShadow:  '0 0 8px rgba(124,58,237,0.4)',
            }} />
        </div>
        <p className="font-display text-[9px] text-gray-600 uppercase tracking-wider mt-1.5 text-right">
          {filled} of {slots.length} stops named
        </p>
      </div>

      {/* Night summary (only when ≥2 timed slots) */}
      <NightSummary slots={slots} />

      {/* Timeline */}
      <div className="space-y-0">
        {slots.map((slot, i) => {
          const isLast = i === slots.length - 1
          const typeConfig = SLOT_TYPES.find(t => t.id === slot.type) || SLOT_TYPES[0]
          return (
            <div key={slot.id}>
              <SlotCard
                slot={slot}
                nextSlot={slots[i + 1]}
                isFirst={i === 0}
                isLast={isLast}
                onChange={(field, val) => updateSlot(slot.id, { [field]: val })}
                onRemove={() => removeSlot(slot.id)}
                onMoveUp={() => moveSlot(slot.id, -1)}
                onMoveDown={() => moveSlot(slot.id, 1)}
                onAddAfter={() => addSlot(slot.id)}
              />
              {/* Travel connector — shown after every slot except the last */}
              {!isLast && (
                <TravelConnector
                  travelMins={slot.travelMinsAfter}
                  color={typeConfig.color}
                  onChange={val => updateSlot(slot.id, { travelMinsAfter: val })}
                  isLast={isLast}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Add stop */}
      <button onClick={() => addSlot()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-quest-border text-gray-600 hover:border-quest-gold-dim hover:text-quest-gold font-display text-xs uppercase tracking-widest transition-all btn-press">
        <Plus size={13} /> Add Stop
      </button>

      {/* Action row */}
      <div className="flex gap-2">
        <button onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          {shareState === 'idle'
            ? <><Copy size={12} /> Share Plan</>
            : <><CheckCircle size={12} className="text-green-400" /> {shareState === 'copied' ? 'Copied!' : 'Shared!'}</>}
        </button>
        <button onClick={() => setShowClear(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-900/40 font-display text-xs uppercase tracking-widest text-red-500/60 hover:text-red-400 hover:border-red-800 transition-all btn-press">
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Tip */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-3.5 flex gap-2.5">
        <span className="text-sm shrink-0">💡</span>
        <p className="font-body text-xs text-gray-500 leading-relaxed">
          <span className="text-quest-gold font-semibold">Tip: </span>
          Tap the travel time between stops to edit it.
          Hit <span className="text-white">Share Plan</span> to send the full itinerary link to your squad.
        </p>
      </div>

      {/* Reset confirm */}
      {showClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,5,10,0.82)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-xs bg-quest-panel border border-quest-border rounded-2xl p-5 text-center animate-slide-up">
            <p className="font-display text-sm font-bold text-white mb-1">Reset plan?</p>
            <p className="font-body text-xs text-gray-500 mb-5">Clears all stops and restores the default template.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClear(false)}
                className="flex-1 py-2 rounded-lg border border-quest-border text-gray-400 font-display text-xs uppercase tracking-wider hover:text-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => { clearPlan(); setShowClear(false) }}
                className="flex-1 py-2 rounded-lg bg-red-900/40 border border-red-700/40 text-red-300 font-display text-xs uppercase tracking-wider hover:bg-red-900/60 transition-colors btn-press">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
