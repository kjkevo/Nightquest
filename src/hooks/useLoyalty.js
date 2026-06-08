import { useState, useCallback } from 'react'
import { LOYALTY_PERKS } from '../data/quizData'

const KEY = 'nq_loyalty_stamps'

function load(fallback) {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? fallback }
  catch { return fallback }
}
function save(v) { localStorage.setItem(KEY, JSON.stringify(v)) }

// stampCards: { [venueId]: { stamps: number, earnedPerks: string[], lastStamp: ts } }
export function useLoyalty() {
  const [stampCards, setStampCards] = useState(() => load({}))

  // Add a stamp for a venue (called on venue check-in or quest completion)
  const addStamp = useCallback((venueId) => {
    setStampCards(prev => {
      const vid = String(venueId)
      const perkDef = LOYALTY_PERKS[venueId]
      const card = prev[vid] || { stamps: 0, earnedPerks: [], lastStamp: null }
      const newStamps = card.stamps + 1
      const threshold = perkDef?.stampsNeeded ?? 0
      const didEarnPerk = threshold > 0 && newStamps >= threshold && !card.earnedPerks.includes(perkDef.perk)

      const updated = {
        ...card,
        stamps: newStamps,
        lastStamp: Date.now(),
        earnedPerks: didEarnPerk ? [...card.earnedPerks, perkDef.perk] : card.earnedPerks,
        newPerkEarned: didEarnPerk ? perkDef.perk : null,
      }
      const next = { ...prev, [vid]: updated }
      save(next)
      return next
    })
  }, [])

  // Remove a stamp (undo)
  const removeStamp = useCallback((venueId) => {
    setStampCards(prev => {
      const vid = String(venueId)
      const card = prev[vid]
      if (!card || card.stamps <= 0) return prev
      const updated = { ...card, stamps: Math.max(0, card.stamps - 1) }
      const next = { ...prev, [vid]: updated }
      save(next)
      return next
    })
  }, [])

  // Clear a card
  const resetCard = useCallback((venueId) => {
    setStampCards(prev => {
      const next = { ...prev }
      delete next[String(venueId)]
      save(next)
      return next
    })
  }, [])

  // Clear new perk flag after showing it
  const acknowledgeNewPerk = useCallback((venueId) => {
    setStampCards(prev => {
      const vid = String(venueId)
      if (!prev[vid]) return prev
      const next = { ...prev, [vid]: { ...prev[vid], newPerkEarned: null } }
      save(next)
      return next
    })
  }, [])

  // Get card info for a venue
  const getCard = useCallback((venueId) => {
    const vid = String(venueId)
    const perkDef = LOYALTY_PERKS[venueId]
    const card = stampCards[vid] || { stamps: 0, earnedPerks: [], lastStamp: null }
    if (!perkDef) return null   // venue has no loyalty program
    const progress = Math.min(card.stamps, perkDef.stampsNeeded)
    const isComplete = card.stamps >= perkDef.stampsNeeded
    return {
      venueId,
      stamps: card.stamps,
      stampsNeeded: perkDef.stampsNeeded,
      perk: perkDef.perk,
      tier: perkDef.tier,
      progress,
      isComplete,
      earnedPerks: card.earnedPerks || [],
      lastStamp: card.lastStamp,
      newPerkEarned: card.newPerkEarned || null,
    }
  }, [stampCards])

  // All venues that have loyalty programs, with card state
  const allCards = Object.keys(LOYALTY_PERKS).map(id => getCard(Number(id))).filter(Boolean)

  // Cards with progress
  const activeCards = allCards.filter(c => c.stamps > 0)

  // Total stamps across all venues
  const totalStamps = allCards.reduce((s, c) => s + c.stamps, 0)

  // Total perks earned
  const totalPerksEarned = allCards.reduce((s, c) => s + c.earnedPerks.length, 0)

  return {
    stampCards,
    addStamp,
    removeStamp,
    resetCard,
    acknowledgeNewPerk,
    getCard,
    allCards,
    activeCards,
    totalStamps,
    totalPerksEarned,
  }
}
