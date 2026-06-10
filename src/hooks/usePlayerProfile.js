import { useState, useCallback } from 'react'

const PROFILE_KEY = 'nq_player_profile'

const DEFAULT_PROFILE = {
  displayName: '',
  avatar: 'preset_1',
  motto: '',
  campus: '',
  memberSince: Date.now(),
}

const AVATAR_PRESETS = [
  { id: 'preset_1', emoji: '🌙', label: 'Night Owl' },
  { id: 'preset_2', emoji: '⚔️', label: 'Quest Master' },
  { id: 'preset_3', emoji: '👑', label: 'Legend' },
  { id: 'preset_4', emoji: '🎉', label: 'Party Animal' },
  { id: 'preset_5', emoji: '🧛', label: 'Midnight Creature' },
  { id: 'preset_6', emoji: '🦇', label: 'Night Creature' },
  { id: 'preset_7', emoji: '✨', label: 'Starlight' },
  { id: 'preset_8', emoji: '🔥', label: 'Fire' },
  { id: 'preset_9', emoji: '💎', label: 'Diamond' },
  { id: 'preset_10', emoji: '🎭', label: 'Drama' },
]

export function usePlayerProfile() {
  const [profile, setProfileState] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY)
      return stored ? JSON.parse(stored) : { ...DEFAULT_PROFILE }
    } catch {
      return { ...DEFAULT_PROFILE }
    }
  })

  const updateProfile = useCallback((updates) => {
    setProfileState(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const setDisplayName = useCallback((name) => {
    updateProfile({ displayName: name.trim() })
  }, [updateProfile])

  const setAvatar = useCallback((avatarId) => {
    updateProfile({ avatar: avatarId })
  }, [updateProfile])

  const setMotto = useCallback((motto) => {
    updateProfile({ motto: motto.trim() })
  }, [updateProfile])

  const setCampus = useCallback((campus) => {
    updateProfile({ campus: campus.trim() })
  }, [updateProfile])

  const getAvatarEmoji = useCallback((avatarId) => {
    const preset = AVATAR_PRESETS.find(p => p.id === avatarId)
    return preset ? preset.emoji : AVATAR_PRESETS[0].emoji
  }, [])

  const getAvatarLabel = useCallback((avatarId) => {
    const preset = AVATAR_PRESETS.find(p => p.id === avatarId)
    return preset ? preset.label : AVATAR_PRESETS[0].label
  }, [])

  const formatMemberSince = useCallback((timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [])

  return {
    profile,
    updateProfile,
    setDisplayName,
    setAvatar,
    setMotto,
    setCampus,
    getAvatarEmoji,
    getAvatarLabel,
    formatMemberSince,
    AVATAR_PRESETS,
  }
}
