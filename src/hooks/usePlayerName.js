import { useState, useCallback } from 'react'

const KEY = 'nq_player_name'

export function usePlayerName() {
  const [name, setNameState] = useState(() => {
    try { return localStorage.getItem(KEY) ?? '' } catch { return '' }
  })

  const setName = useCallback((n) => {
    const trimmed = n.trim()
    setNameState(trimmed)
    try { localStorage.setItem(KEY, trimmed) } catch {}
  }, [])

  return { name, setName }
}
