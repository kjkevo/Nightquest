import { useState, useCallback } from 'react'

const KEY = 'nq_setup'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { return null }
}
function save(v) { localStorage.setItem(KEY, JSON.stringify(v)) }

export const NEIGHBORHOODS = [
  'Downtown Core', 'Campus Area', 'Midtown', 'Uptown',
  'Westside', 'Eastside', 'South End', 'Waterfront',
  'Arts District', 'Financial District',
]

export const POPULAR_UNIVERSITIES = [
  'NYU', 'UCLA', 'USC', 'UT Austin', 'University of Michigan',
  'Boston University', 'Northeastern', 'Columbia', 'Penn State',
  'Ohio State', 'UNC Chapel Hill', 'Arizona State', 'Other',
]

export function useOnboarding() {
  const [setup, setSetup] = useState(() => load())

  const isOnboarded = setup !== null
  const isFirstVisit = setup === null

  const completeOnboarding = useCallback((data) => {
    const entry = {
      university: data.university || '',
      area: data.area || '',
      squad: data.squad || [],
      completedAt: Date.now(),
    }
    save(entry)
    setSetup(entry)

    // Persist squad names to the squad room data
    if (entry.squad.length > 0) {
      try { localStorage.setItem('nq_onboard_squad', JSON.stringify(entry.squad)) } catch {}
    }
    return entry
  }, [])

  const skipOnboarding = useCallback(() => {
    completeOnboarding({ university: '', area: '', squad: [] })
  }, [completeOnboarding])

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(KEY)
    setSetup(null)
  }, [])

  const updateSetup = useCallback((patch) => {
    setSetup(prev => {
      const next = { ...prev, ...patch }
      save(next)
      return next
    })
  }, [])

  return { setup, isOnboarded, isFirstVisit, completeOnboarding, skipOnboarding, resetOnboarding, updateSetup }
}
