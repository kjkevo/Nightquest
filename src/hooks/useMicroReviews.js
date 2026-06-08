import { useState, useCallback } from 'react'

const KEY = 'nq_micro_reviews'
const DECAY_MS = 3 * 60 * 60 * 1000  // 3 hours

export const REVIEW_TAGS = [
  { id: 'line_crazy',   label: 'Line crazy',    emoji: '😤', vibe: 'negative' },
  { id: 'line_none',    label: 'No line',        emoji: '✅', vibe: 'positive' },
  { id: 'dj_fire',      label: 'DJ is fire',     emoji: '🔥', vibe: 'positive' },
  { id: 'dead',         label: 'Dead inside',    emoji: '💀', vibe: 'negative' },
  { id: 'packed',       label: 'Packed',         emoji: '🎪', vibe: 'neutral'  },
  { id: 'empty',        label: 'Empty',          emoji: '🏜️', vibe: 'neutral'  },
  { id: 'vibe_check',   label: 'Vibe immaculate',emoji: '✨', vibe: 'positive' },
  { id: 'cheap_drinks', label: 'Cheap drinks',   emoji: '🪙', vibe: 'positive' },
  { id: 'pricey',       label: 'Pricey AF',      emoji: '💸', vibe: 'negative' },
  { id: 'great_music',  label: 'Great music',    emoji: '🎶', vibe: 'positive' },
  { id: 'sketchy',      label: 'Feels off',      emoji: '👀', vibe: 'negative' },
  { id: 'staff_cool',   label: 'Staff is cool',  emoji: '🤝', vibe: 'positive' },
  { id: 'bouncer_bad',  label: 'Bouncer on one', emoji: '😠', vibe: 'negative' },
  { id: 'outdoor_nice', label: 'Outdoor vibes',  emoji: '🌙', vibe: 'positive' },
  { id: 'sticky_floor', label: 'Sticky floor',   emoji: '😬', vibe: 'negative' },
]

function load(fallback) {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? fallback }
  catch { return fallback }
}
function save(v) { localStorage.setItem(KEY, JSON.stringify(v)) }

// Returns reviews that haven't expired (within DECAY_MS)
function fresh(reviews) {
  const cutoff = Date.now() - DECAY_MS
  return reviews.filter(r => r.ts > cutoff)
}

export function useMicroReviews() {
  const [reviews, setReviews] = useState(() => fresh(load([])))

  // Submit a tag review for a venue
  const submitReview = useCallback((venueId, tagId) => {
    setReviews(prev => {
      const trimmed = fresh(prev)
      const entry = { id: `rev_${Date.now()}`, venueId, tagId, ts: Date.now() }
      const next = [entry, ...trimmed].slice(0, 500)
      save(next)
      return next
    })
  }, [])

  // Get aggregated tags for a venue (sorted by count, only non-expired)
  const getVenueTags = useCallback((venueId) => {
    const liveReviews = fresh(reviews)
    const forVenue = liveReviews.filter(r => r.venueId === venueId)
    if (!forVenue.length) return []

    const counts = {}
    forVenue.forEach(r => { counts[r.tagId] = (counts[r.tagId] || 0) + 1 })

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tagId, count]) => ({
        ...REVIEW_TAGS.find(t => t.id === tagId),
        count,
        // Freshness: how recently the last one was submitted (for recency badge)
        lastTs: Math.max(...forVenue.filter(r => r.tagId === tagId).map(r => r.ts)),
      }))
      .filter(Boolean)
  }, [reviews])

  // Total review count for a venue
  const getVenueReviewCount = useCallback((venueId) => {
    return fresh(reviews).filter(r => r.venueId === venueId).length
  }, [reviews])

  // Has the current user reviewed this venue recently (within 30 min — throttle)
  const hasRecentlyReviewed = useCallback((venueId) => {
    const throttle = 30 * 60 * 1000
    const cutoff = Date.now() - throttle
    return reviews.some(r => r.venueId === venueId && r.ts > cutoff)
  }, [reviews])

  // Overall vibe sentiment for a venue: positive/negative/neutral or null
  const getVenueSentiment = useCallback((venueId) => {
    const tags = getVenueTags(venueId)
    if (!tags.length) return null
    let score = 0
    tags.forEach(t => {
      const def = REVIEW_TAGS.find(r => r.id === t.id)
      if (def?.vibe === 'positive') score += t.count
      if (def?.vibe === 'negative') score -= t.count
    })
    if (score > 0) return 'positive'
    if (score < 0) return 'negative'
    return 'neutral'
  }, [getVenueTags])

  // Purge expired entries (call occasionally)
  const purgeExpired = useCallback(() => {
    setReviews(prev => {
      const next = fresh(prev)
      save(next)
      return next
    })
  }, [])

  return {
    reviews,
    submitReview,
    getVenueTags,
    getVenueReviewCount,
    hasRecentlyReviewed,
    getVenueSentiment,
    purgeExpired,
  }
}
