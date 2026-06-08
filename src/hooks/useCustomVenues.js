/**
 * useCustomVenues — user-added venues stored in localStorage.
 *
 * The shipped VENUES list is labelled "Sample Picks" — users can add their
 * own local spots which are mixed into the feed with a "Yours" badge.
 */

import { useState, useCallback } from 'react'

const KEY = 'nq_custom_venues'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? [] }
  catch { return [] }
}

function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}

let _uid = Date.now()

export function useCustomVenues() {
  const [venues, setVenues] = useState(load)

  const addVenue = useCallback((venue) => {
    setVenues(prev => {
      const newOne = {
        id:              `custom_${++_uid}`,
        custom:          true,
        name:            venue.name?.trim() || 'Untitled venue',
        type:            venue.type        || 'Bar',
        neighborhood:    venue.neighborhood?.trim() || 'Local',
        address:         venue.address?.trim()      || '',
        notes:           venue.notes?.trim()        || '',
        // Defaults so VenueCard renders without errors
        distanceMiles:   venue.distanceMiles ?? 0.5,
        walkMinutes:     venue.walkMinutes   ?? 10,
        hours:           venue.hours ?? { open: '17:00', close: '02:00' },
        coverCharge:     { amount: 0, verified: false, note: 'Unknown' },
        dressCode:       'casual',
        ageRequirement:  21,
        busynessBase:    50,
        rating:          venue.rating ?? 4.0,
        reviewCount:     0,
        tags:            venue.tags ?? [],
        amenities:       [],
        happyHours:      [],
        specials:        [],
        campusArea:      false,
        campusDistanceMiles: 1.0,
        vibe:            'chill',
        priceRange:      2,
        addedAt:         Date.now(),
      }
      const next = [...prev, newOne]
      save(next)
      return next
    })
  }, [])

  const removeVenue = useCallback((id) => {
    setVenues(prev => {
      const next = prev.filter(v => v.id !== id)
      save(next)
      return next
    })
  }, [])

  const updateVenue = useCallback((id, patch) => {
    setVenues(prev => {
      const next = prev.map(v => v.id === id ? { ...v, ...patch } : v)
      save(next)
      return next
    })
  }, [])

  return { customVenues: venues, addVenue, removeVenue, updateVenue }
}
