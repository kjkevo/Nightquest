import { useState, useEffect, useRef } from 'react'

function safeRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

/**
 * Persists an active quest session to localStorage so closing/refreshing
 * the tab doesn't wipe in-progress quest state.
 *
 * Returns [session, setSession, clearSession].
 * `session` is null when no active session exists.
 *
 * Session shape (caller decides what goes in it; this hook is agnostic):
 *   solo:  { step, outing, difficulty, tasks, completedIds[], sessionXP }
 *   squad: { view, players, outing, difficulty, tasks, completedIds[] }
 *
 * completedIds is stored as a plain array (Sets aren't JSON-serialisable).
 */
export function useActiveSession(storageKey) {
  const [session, setSessionRaw] = useState(() => safeRead(storageKey, null))
  const keyRef = useRef(storageKey)
  keyRef.current = storageKey

  // Sync every change to localStorage
  useEffect(() => {
    if (session === null) {
      localStorage.removeItem(keyRef.current)
    } else {
      try { localStorage.setItem(keyRef.current, JSON.stringify(session)) }
      catch { /* storage full — fail silently */ }
    }
  }, [session])

  const setSession = (updater) =>
    setSessionRaw(prev =>
      typeof updater === 'function' ? updater(prev) : updater
    )

  const clearSession = () => setSessionRaw(null)

  return [session, setSession, clearSession]
}
