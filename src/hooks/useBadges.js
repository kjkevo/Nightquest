import { useState, useCallback, useMemo } from 'react'
import { useGameStats } from './useGameStats'

const BADGES_KEY = 'nq_badges'
const PINNED_BADGES_KEY = 'nq_pinned_badges'

export const BADGE_DEFINITIONS = [
  // Starter Badges
  {
    id: 'first_night_out',
    name: 'First Night Out',
    description: 'Completed your first mission',
    icon: '🌙',
    rarity: 'common',
    unlockCondition: (stats) => stats.totalMissions >= 1,
    unlockedMessage: 'Welcome to the night!',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play 5 nights',
    icon: '🦉',
    rarity: 'common',
    unlockCondition: (stats) => stats.totalNights >= 5,
    unlockedMessage: 'You\'re a creature of the night!',
  },
  {
    id: 'mission_master',
    name: 'Mission Master',
    description: 'Complete 10 missions',
    icon: '🎯',
    rarity: 'common',
    unlockCondition: (stats) => stats.totalMissions >= 10,
    unlockedMessage: 'You\'re mastering the art of missions!',
  },

  // Difficulty Badges
  {
    id: 'easy_street',
    name: 'Easy Street',
    description: 'Complete 5 Easy missions',
    icon: '🟢',
    rarity: 'common',
    unlockCondition: (stats) => stats.difficultyBreakdown.easy >= 5,
    unlockedMessage: 'Warming up!',
  },
  {
    id: 'medium_rare',
    name: 'Medium Rare',
    description: 'Complete 5 Medium missions',
    icon: '🟠',
    rarity: 'rare',
    unlockCondition: (stats) => stats.difficultyBreakdown.medium >= 5,
    unlockedMessage: 'You\'re getting serious!',
  },
  {
    id: 'hard_mode',
    name: 'Hard Mode',
    description: 'Complete 5 Hard missions',
    icon: '🔴',
    rarity: 'epic',
    unlockCondition: (stats) => stats.difficultyBreakdown.hard >= 5,
    unlockedMessage: 'You\'re a legend!',
  },

  // Venue Badges
  {
    id: 'bar_hopper',
    name: 'Bar Hopper',
    description: 'Complete 5 Bar missions',
    icon: '🍺',
    rarity: 'common',
    unlockCondition: (stats) => stats.venueStats.bar.completed >= 5,
    unlockedMessage: 'Barfly level unlocked!',
  },
  {
    id: 'club_king',
    name: 'Club King',
    description: 'Complete 5 Club missions',
    icon: '🎉',
    rarity: 'rare',
    unlockCondition: (stats) => stats.venueStats.club.completed >= 5,
    unlockedMessage: 'You own the dance floor!',
  },
  {
    id: 'rave_nomad',
    name: 'Rave Nomad',
    description: 'Complete 5 Rave missions',
    icon: '🎵',
    rarity: 'epic',
    unlockCondition: (stats) => stats.venueStats.rave.completed >= 5,
    unlockedMessage: 'One with the beat!',
  },
  {
    id: 'open_mic_maven',
    name: 'Open Mic Maven',
    description: 'Complete 5 Open Mic missions',
    icon: '🎤',
    rarity: 'rare',
    unlockCondition: (stats) => stats.venueStats.openmic.completed >= 5,
    unlockedMessage: 'Master of the stage!',
  },
  {
    id: 'venue_hunter',
    name: 'Venue Hunter',
    description: 'Visit 10 unique venues',
    icon: '🗺️',
    rarity: 'epic',
    unlockCondition: (stats) => stats.uniqueVenuesCount >= 10,
    unlockedMessage: 'You\'ve explored the map!',
  },

  // Squad Badges
  {
    id: 'squad_leader',
    name: 'Squad Leader',
    description: 'Complete 10 Squad missions',
    icon: '👑',
    rarity: 'rare',
    unlockCondition: (stats) => stats.missionsByType.squad.completed >= 10,
    unlockedMessage: 'Lead from the front!',
  },
  {
    id: 'solo_artist',
    name: 'Solo Artist',
    description: 'Complete 10 Solo missions',
    icon: '🎸',
    rarity: 'rare',
    unlockCondition: (stats) => stats.missionsByType.solo.completed >= 10,
    unlockedMessage: 'You don\'t need anyone!',
  },

  // Volume Badges
  {
    id: 'quest_warrior',
    name: 'Quest Warrior',
    description: 'Complete 25 missions',
    icon: '⚔️',
    rarity: 'epic',
    unlockCondition: (stats) => stats.totalMissions >= 25,
    unlockedMessage: 'You\'re a true warrior!',
  },
  {
    id: 'night_legend',
    name: 'Night Legend',
    description: 'Play 20 nights',
    icon: '⭐',
    rarity: 'legendary',
    unlockCondition: (stats) => stats.totalNights >= 20,
    unlockedMessage: 'You\'re a living legend!',
  },
  {
    id: 'quest_champion',
    name: 'Quest Champion',
    description: 'Complete 50 quests',
    icon: '🏆',
    rarity: 'legendary',
    unlockCondition: (stats) => stats.totalQuestsCompleted >= 50,
    unlockedMessage: 'The ultimate champion!',
  },

  // Consistency Badges
  {
    id: 'consistent_performer',
    name: 'Consistent Performer',
    description: 'Maintain 80%+ completion rate',
    icon: '📈',
    rarity: 'epic',
    unlockCondition: (stats) => stats.completionRate >= 80,
    unlockedMessage: 'You finish what you start!',
  },
  {
    id: 'speedster',
    name: 'Speedster',
    description: 'Average 3+ missions per night',
    icon: '⚡',
    rarity: 'epic',
    unlockCondition: (stats) => stats.avgMissionsPerNight >= 3,
    unlockedMessage: 'You\'re moving fast!',
  },

  // Milestone Badges
  {
    id: 'first_week',
    name: 'First Week',
    description: 'Been active for 7 days',
    icon: '📅',
    rarity: 'common',
    unlockCondition: (stats) => stats.daysSinceStart >= 7,
    unlockedMessage: 'One week down!',
  },
  {
    id: 'one_month_wonder',
    name: 'One Month Wonder',
    description: 'Been active for 30 days',
    icon: '🌟',
    rarity: 'rare',
    unlockCondition: (stats) => stats.daysSinceStart >= 30,
    unlockedMessage: 'A month of memories!',
  },
]

export function useBadges() {
  const stats = useGameStats()
  const [pinnedBadges, setPinnedBadgesState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PINNED_BADGES_KEY) || '[]').slice(0, 3)
    } catch {
      return []
    }
  })

  // Calculate earned badges based on stats
  const earnedBadges = useMemo(() => {
    return BADGE_DEFINITIONS.filter(badge => badge.unlockCondition(stats))
      .map(badge => badge.id)
  }, [stats])

  // Get badge details
  const getBadgeInfo = useCallback((badgeId) => {
    return BADGE_DEFINITIONS.find(b => b.id === badgeId)
  }, [])

  // Check if badge is earned
  const isBadgeEarned = useCallback((badgeId) => {
    return earnedBadges.includes(badgeId)
  }, [earnedBadges])

  // Pin/unpin badge
  const togglePinnedBadge = useCallback((badgeId) => {
    setPinnedBadgesState(prev => {
      let next
      if (prev.includes(badgeId)) {
        // Remove if already pinned
        next = prev.filter(id => id !== badgeId)
      } else {
        // Add if not pinned (max 3)
        if (prev.length < 3) {
          next = [...prev, badgeId]
        } else {
          next = prev
        }
      }
      try {
        localStorage.setItem(PINNED_BADGES_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  // Get pinned badge details
  const getPinnedBadgeDetails = useCallback(() => {
    return pinnedBadges.map(id => getBadgeInfo(id)).filter(Boolean)
  }, [pinnedBadges, getBadgeInfo])

  return {
    allBadges: BADGE_DEFINITIONS,
    earnedBadges,
    pinnedBadges,
    isBadgeEarned,
    getBadgeInfo,
    togglePinnedBadge,
    getPinnedBadgeDetails,
    earnedCount: earnedBadges.length,
    totalCount: BADGE_DEFINITIONS.length,
  }
}
