import { useState } from 'react'
import { MessageSquarePlus, Clock } from 'lucide-react'
import { REVIEW_TAGS } from '../hooks/useMicroReviews'

const VIBE_COLORS = {
  positive: 'text-green-400',
  negative: 'text-red-400',
  neutral:  'text-gray-400',
}

function timeAgoShort(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

// ── Tag Pill (aggregated display) ──────────────────────────────────────────────
function TagPill({ tag, onClick, selected }) {
  const def = REVIEW_TAGS.find(t => t.id === tag.id)
  if (!def) return null
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-display font-semibold transition-all btn-press
        ${selected
          ? 'bg-quest-gold/20 border-quest-gold-dim text-quest-gold'
          : def.vibe === 'positive'
            ? 'bg-green-900/20 border-green-800 text-green-400 hover:border-green-600'
            : def.vibe === 'negative'
              ? 'bg-red-900/20 border-red-800 text-red-400 hover:border-red-600'
              : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-500'}`}
    >
      <span>{def.emoji}</span>
      <span>{def.label}</span>
      {tag.count && <span className="opacity-60">·{tag.count}</span>}
    </button>
  )
}

// ── Main Widget ────────────────────────────────────────────────────────────────
export default function MicroReviewWidget({
  venueId,
  venueTags,
  reviewCount,
  hasReviewed,
  onSubmit,
  compact = false,
}) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleTag = (tagId) => {
    onSubmit(venueId, tagId)
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setOpen(false) }, 1500)
  }

  // Compact mode: just show top tags + button
  if (compact) {
    return (
      <div className="mt-2 space-y-1.5">
        {venueTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {venueTags.slice(0, 3).map(tag => (
              <TagPill key={tag.id} tag={tag} />
            ))}
            {reviewCount > 0 && (
              <span className="text-[9px] text-gray-700 font-body self-center">
                {reviewCount} live
              </span>
            )}
          </div>
        )}
        {!hasReviewed && (
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1 text-[10px] text-purple-500 hover:text-purple-400 font-display uppercase tracking-wider transition-colors"
          >
            <MessageSquarePlus size={10} /> Rate it
          </button>
        )}
        {open && !hasReviewed && !submitted && (
          <TagSelector onSelect={handleTag} />
        )}
        {submitted && (
          <p className="text-[10px] text-green-400 font-display animate-fade-in">✓ Thanks!</p>
        )}
      </div>
    )
  }

  // Full mode
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquarePlus size={12} className="text-purple-400" />
          <span className="font-display text-[10px] uppercase tracking-widest text-gray-500">Live Crowd</span>
          {reviewCount > 0 && (
            <span className="text-[9px] text-gray-700 font-body">({reviewCount} tags)</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[9px] text-gray-700 font-body">
          <Clock size={9} /> fades in 3h
        </div>
      </div>

      {/* Active tags */}
      {venueTags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {venueTags.map(tag => (
            <TagPill key={tag.id} tag={tag} />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-gray-700 font-body italic">
          No live reviews yet — be first.
        </p>
      )}

      {/* Submit row */}
      {hasReviewed ? (
        <div className="flex items-center gap-1 text-[10px] text-gray-700 font-body">
          <Clock size={9} /> You tagged this recently
        </div>
      ) : submitted ? (
        <p className="text-[10px] text-green-400 font-display animate-fade-in">✓ Tag submitted!</p>
      ) : (
        <>
          <button
            onClick={() => setOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-display text-[10px] uppercase tracking-widest transition-all btn-press
              ${open
                ? 'bg-purple-900/30 border-purple-700 text-purple-300'
                : 'bg-quest-panel border-quest-border text-gray-500 hover:text-gray-300 hover:border-gray-600'}`}
          >
            <MessageSquarePlus size={11} />
            {open ? 'Cancel' : 'Drop a tag'}
          </button>
          {open && <TagSelector onSelect={handleTag} />}
        </>
      )}
    </div>
  )
}

// ── Tag selector grid ─────────────────────────────────────────────────────────
function TagSelector({ onSelect }) {
  return (
    <div className="animate-fade-in">
      <p className="text-[9px] text-gray-700 font-body mb-1.5 uppercase tracking-wider">
        What's the vibe right now?
      </p>
      <div className="flex flex-wrap gap-1">
        {REVIEW_TAGS.map(tag => (
          <button
            key={tag.id}
            onClick={() => onSelect(tag.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full border font-display text-[10px] font-semibold transition-all btn-press
              ${tag.vibe === 'positive'
                ? 'bg-green-900/20 border-green-800 text-green-300 hover:bg-green-900/40'
                : tag.vibe === 'negative'
                  ? 'bg-red-900/20 border-red-800 text-red-300 hover:bg-red-900/40'
                  : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700/40'}`}
          >
            <span>{tag.emoji}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
