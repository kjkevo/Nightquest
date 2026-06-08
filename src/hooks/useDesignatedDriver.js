/**
 * useDesignatedDriver — squad-local "who's the DD tonight" tracker.
 *
 * Stored in localStorage per-night. Doesn't sync across devices yet
 * (cooperative — whoever sets it locally is the canonical answer for that device).
 */

import { useState, useCallback, useEffect } from 'react'

const KEY = 'nq_designated_driver'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') }
  catch { return null }
}

function save(v) {
  try {
    if (v == null) localStorage.removeItem(KEY)
    else           localStorage.setItem(KEY, JSON.stringify(v))
  } catch {}
}

export function useDesignatedDriver() {
  const [dd, setDDState] = useState(load)

  // Auto-clear after 18 hours so it doesn't carry across nights
  useEffect(() => {
    if (!dd?.setAt) return
    const age = Date.now() - dd.setAt
    if (age > 18 * 3600 * 1000) {
      setDDState(null)
      save(null)
    }
  }, [dd])

  const setDD = useCallback((name) => {
    if (!name?.trim()) return
    const entry = { name: name.trim(), setAt: Date.now() }
    setDDState(entry)
    save(entry)
  }, [])

  const clearDD = useCallback(() => {
    setDDState(null)
    save(null)
  }, [])

  return { dd, setDD, clearDD }
}
