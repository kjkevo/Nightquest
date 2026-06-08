/**
 * useLocation — geolocation permission state machine + manual fallback.
 *
 * Status flow:
 *   'unknown'    — never asked (first visit to Explore)
 *   'requesting' — waiting for browser permission dialog
 *   'granted'    — have coordinates; city may be resolved via reverse-geocode
 *   'denied'     — browser permission denied or error
 *   'manual'     — user typed a city / postcode instead
 *
 * Everything is persisted to localStorage so the prompt only fires once.
 */

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'nq_location'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? { status: 'unknown' } }
  catch { return { status: 'unknown' } }
}

function persist(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

/** Reverse-geocode coordinates → city name via Nominatim (free, no key needed). */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return (
      data.address?.city        ||
      data.address?.town        ||
      data.address?.village     ||
      data.address?.county      ||
      null
    )
  } catch { return null }
}

export function useLocation() {
  const [loc, setLocRaw] = useState(load)

  const setLoc = useCallback((next) => {
    setLocRaw(next)
    persist(next)
  }, [])

  /** Ask the browser for GPS permission. */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLoc({ status: 'denied', coords: null, city: null, error: 'not_supported' })
      return
    }
    setLoc({ ...loc, status: 'requesting' })

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        // Optimistically mark as granted with coords; update city when geocode resolves
        const base = { status: 'granted', coords, city: null }
        setLoc(base)
        const city = await reverseGeocode(coords.lat, coords.lng)
        if (city) setLoc({ ...base, city })
      },
      (err) => {
        const reason = err.code === 1 ? 'denied'
          : err.code === 2 ? 'unavailable'
          : 'timeout'
        setLoc({ status: 'denied', coords: null, city: null, error: reason })
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc, setLoc])

  /** Store a manually entered city / postcode. */
  const setManualCity = useCallback((city) => {
    setLoc({ status: 'manual', coords: null, city: city.trim() })
  }, [setLoc])

  /** Go back to the permission prompt (e.g. "Change location" link). */
  const resetLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setLocRaw({ status: 'unknown' })
  }, [])

  /** Human-readable display label for the current location. */
  const locationLabel =
    loc.status === 'granted' ? (loc.city ?? 'Your location')
    : loc.status === 'manual' ? loc.city
    : null

  return {
    status:        loc.status,       // 'unknown' | 'requesting' | 'granted' | 'denied' | 'manual'
    coords:        loc.coords,       // { lat, lng } | null
    city:          loc.city,         // string | null
    locationLabel,                   // display string | null
    requestLocation,
    setManualCity,
    resetLocation,
  }
}
