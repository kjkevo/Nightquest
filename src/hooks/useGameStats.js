import { useMemo } from 'react'
import { useMemories } from './useMemories'

const MISSION_HISTORY_KEY = 'nq_mission_history'

// Mission history structure:
// { id, title, missionId, outing, difficulty, xp, completedAt, mode }

export function useGameStats() {
  const { nights } = useMemories()

  const stats = useMemo(() => {
    // Load mission history
    let missionHistory = []
    try {
      missionHistory = JSON.parse(localStorage.getItem(MISSION_HISTORY_KEY) || '[]')
    } catch {
      missionHistory = []
    }

    // Calculate statistics from nights
    const totalNights = nights.length
    const totalQuestsCompleted = nights.reduce((sum, n) => sum + (n.questsCompleted || 0), 0)

    // Stats by venue type
    const venueStats = {}
    const VENUE_TYPES = {
      bar: { label: 'Bar', icon: '🍺' },
      club: { label: 'Club', icon: '🎉' },
      rave: { label: 'Rave/Concert', icon: '🎵' },
      openmic: { label: 'Open Mic', icon: '🎤' },
      squad: { label: 'Squad', icon: '👥' },
    }

    Object.keys(VENUE_TYPES).forEach(type => {
      venueStats[type] = {
        ...VENUE_TYPES[type],
        completed: missionHistory.filter(m => m.outing === type).length,
      }
    })

    // Difficulty breakdown
    const difficultyBreakdown = {
      easy: missionHistory.filter(m => m.difficulty === 'easy').length,
      medium: missionHistory.filter(m => m.difficulty === 'medium').length,
      hard: missionHistory.filter(m => m.difficulty === 'hard').length,
    }

    // Solo vs Squad split
    const soloMissions = missionHistory.filter(m => m.mode === 'quest').length
    const squadMissions = missionHistory.filter(m => m.mode === 'squad').length
    const totalMissions = missionHistory.length

    // Completion rate (we'll estimate as questsCompleted/potential)
    const estimatedMissionsStarted = Math.max(totalMissions * 1.2, totalQuestsCompleted) // Rough estimate
    const completionRate = totalMissions > 0 ? Math.round((totalQuestsCompleted / estimatedMissionsStarted) * 100) : 0

    // Favorite venue
    let favoriteVenue = null
    let maxVenueCount = 0
    nights.forEach(night => {
      if (night.venues && night.venues.length > 0) {
        night.venues.forEach(venue => {
          const count = nights.filter(n => n.venues && n.venues.includes(venue)).length
          if (count > maxVenueCount) {
            maxVenueCount = count
            favoriteVenue = venue
          }
        })
      }
    })

    // Total unique venues
    const uniqueVenues = new Set()
    nights.forEach(night => {
      if (night.venues) {
        night.venues.forEach(v => uniqueVenues.add(v))
      }
    })

    // Mission type distribution
    const missionsByType = {
      solo: {
        label: 'Solo Missions',
        icon: '🧑',
        completed: soloMissions,
        percentage: totalMissions > 0 ? Math.round((soloMissions / totalMissions) * 100) : 0,
      },
      squad: {
        label: 'Squad Missions',
        icon: '👥',
        completed: squadMissions,
        percentage: totalMissions > 0 ? Math.round((squadMissions / totalMissions) * 100) : 0,
      },
    }

    // Time-based stats
    let oldestNight = null
    if (nights.length > 0) {
      oldestNight = Math.min(...nights.map(n => n.savedAt || Date.now()))
    }

    const daysSinceStart = oldestNight ? Math.floor((Date.now() - oldestNight) / (1000 * 60 * 60 * 24)) : 0

    return {
      totalNights,
      totalMissions,
      totalQuestsCompleted,
      venueStats,
      difficultyBreakdown,
      missionsByType,
      soloMissions,
      squadMissions,
      completionRate,
      favoriteVenue: favoriteVenue || 'Not yet determined',
      uniqueVenuesCount: uniqueVenues.size,
      daysSinceStart,
      avgMissionsPerNight: totalNights > 0 ? Math.round(totalMissions / totalNights) : 0,
      avgQuestsPerNight: totalNights > 0 ? Math.round(totalQuestsCompleted / totalNights) : 0,
    }
  }, [nights])

  return stats
}

// Helper function to record mission completion
export function recordMissionCompletion(missionId, title, outing, difficulty, xp, mode = 'quest') {
  try {
    const history = JSON.parse(localStorage.getItem(MISSION_HISTORY_KEY) || '[]')
    history.push({
      id: `mission_${Date.now()}`,
      missionId,
      title,
      outing,
      difficulty,
      xp,
      mode,
      completedAt: Date.now(),
    })
    // Keep last 1000 missions
    const trimmed = history.slice(-1000)
    localStorage.setItem(MISSION_HISTORY_KEY, JSON.stringify(trimmed))
  } catch (err) {
    console.error('Failed to record mission:', err)
  }
}

// Helper function to clear all mission history
export function clearMissionHistory() {
  try {
    localStorage.removeItem(MISSION_HISTORY_KEY)
  } catch {
    // ignore
  }
}
