import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { useMemories } from '../hooks/useMemories'

const VENUE_TYPES = [
  { id: 'all', label: 'All Venues', emoji: '🗺️' },
  { id: 'bar', label: 'Bar Night', emoji: '🍺' },
  { id: 'club', label: 'Club', emoji: '🎉' },
  { id: 'rave', label: 'Rave/Concert', emoji: '🎵' },
  { id: 'openmic', label: 'Open Mic', emoji: '🎤' },
]

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All Difficulties', color: '#9ca3af' },
  { id: 'easy', label: 'Easy', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'hard', label: 'Hard', color: '#ef4444' },
]

export default function GameHistory() {
  const { nights } = useMemories()
  const [venueFilter, setVenueFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [expandedNight, setExpandedNight] = useState(null)

  // Filter and sort nights
  const filteredNights = useMemo(() => {
    let filtered = [...nights]

    // Filter by venue
    if (venueFilter !== 'all') {
      filtered = filtered.filter(night => {
        if (!night.venues || night.venues.length === 0) return false
        // Check if any venue matches the filter
        return night.venues.some(venue => {
          // Map venue names to venue types
          if (venueFilter === 'bar') return venue.toLowerCase().includes('bar')
          if (venueFilter === 'club') return venue.toLowerCase().includes('club')
          if (venueFilter === 'rave') return venue.toLowerCase().includes('rave') || venue.toLowerCase().includes('concert')
          if (venueFilter === 'openmic') return venue.toLowerCase().includes('open mic') || venue.toLowerCase().includes('openmic')
          return false
        })
      })
    }

    // Filter by difficulty (estimated from mission count and XP ratio)
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(night => {
        const avgXpPerMission = night.questsCompleted > 0 ? night.xpEarned / night.questsCompleted : 0
        // Estimate difficulty: easy ~50 XP/mission, medium ~80 XP/mission, hard ~120 XP/mission
        let estimatedDifficulty = 'easy'
        if (avgXpPerMission > 100) estimatedDifficulty = 'hard'
        else if (avgXpPerMission > 70) estimatedDifficulty = 'medium'
        return estimatedDifficulty === difficultyFilter
      })
    }

    // Sort chronologically (newest first)
    return filtered.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
  }, [nights, venueFilter, difficultyFilter])

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  // Get difficulty color
  const getDifficultyColor = (questsCompleted, xpEarned) => {
    const avgXpPerMission = questsCompleted > 0 ? xpEarned / questsCompleted : 0
    if (avgXpPerMission > 100) return '#ef4444' // hard
    if (avgXpPerMission > 70) return '#f59e0b' // medium
    return '#22c55e' // easy
  }

  const getDifficultyLabel = (questsCompleted, xpEarned) => {
    const avgXpPerMission = questsCompleted > 0 ? xpEarned / questsCompleted : 0
    if (avgXpPerMission > 100) return 'Hard'
    if (avgXpPerMission > 70) return 'Medium'
    return 'Easy'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        {/* Venue Filter */}
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-gray-500 mb-2">Venue Filter</p>
          <div className="grid grid-cols-5 gap-1">
            {VENUE_TYPES.map(venue => (
              <button
                key={venue.id}
                onClick={() => setVenueFilter(venue.id)}
                className={`py-2 px-2 rounded-lg text-center transition-all text-[10px] font-bold uppercase tracking-widest ${
                  venueFilter === venue.id
                    ? 'bg-quest-gold/20 border border-quest-gold text-quest-gold'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                title={venue.label}>
                <div className="text-sm">{venue.emoji}</div>
                <div className="text-[9px]">{venue.label.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-gray-500 mb-2">Difficulty Filter</p>
          <div className="flex gap-2">
            {DIFFICULTY_FILTERS.map(diff => (
              <button
                key={diff.id}
                onClick={() => setDifficultyFilter(diff.id)}
                className={`flex-1 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${
                  difficultyFilter === diff.id
                    ? 'border-2 text-white'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
                style={difficultyFilter === diff.id ? { borderColor: diff.color, color: diff.color } : {}}>
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Table/List */}
      <div className="space-y-2">
        {filteredNights.length === 0 ? (
          <div className="text-center py-8">
            <Filter size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="font-display text-sm text-gray-500">No games match filters</p>
            <p className="font-body text-xs text-gray-600 mt-1">Try adjusting your venue or difficulty filter</p>
          </div>
        ) : (
          filteredNights.map((night) => {
            const isExpanded = expandedNight === night.id
            const difficultyColor = getDifficultyColor(night.questsCompleted, night.xpEarned)
            const difficultyLabel = getDifficultyLabel(night.questsCompleted, night.xpEarned)
            const venueList = night.venues && night.venues.length > 0 ? night.venues.join(', ') : 'Unknown'

            return (
              <div key={night.id} className="space-y-1">
                {/* Header Row */}
                <button
                  onClick={() => setExpandedNight(isExpanded ? null : night.id)}
                  className="w-full flex items-center gap-2 p-3 rounded-lg bg-quest-panel border border-quest-border hover:border-quest-gold-dim transition-colors">
                  {/* Chevron */}
                  <div className="shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* Main Info Grid */}
                  <div className="flex-1 min-w-0 grid grid-cols-4 gap-2 text-xs">
                    {/* Venue */}
                    <div className="min-w-0">
                      <p className="font-display text-[9px] text-gray-600 uppercase tracking-widest">Venue</p>
                      <p className="font-display font-bold text-white truncate">{venueList}</p>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <p className="font-display text-[9px] text-gray-600 uppercase tracking-widest">Difficulty</p>
                      <p className="font-display font-bold" style={{ color: difficultyColor }}>
                        {difficultyLabel}
                      </p>
                    </div>

                    {/* Missions */}
                    <div>
                      <p className="font-display text-[9px] text-gray-600 uppercase tracking-widest">Missions</p>
                      <p className="font-display font-bold text-white">{night.questsCompleted}</p>
                    </div>

                    {/* XP */}
                    <div>
                      <p className="font-display text-[9px] text-gray-600 uppercase tracking-widest">XP</p>
                      <p className="font-display font-bold text-quest-gold">+{night.xpEarned}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="font-body text-xs text-gray-500">{formatDate(night.savedAt)}</p>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="ml-2 p-3 rounded-lg bg-quest-bg border border-quest-border space-y-2 animate-fade-in">
                    {/* Mood */}
                    {night.mood && (
                      <div className="flex justify-between items-center">
                        <p className="font-body text-xs text-gray-600">Mood</p>
                        <p className="font-display text-sm font-bold text-quest-gold">
                          {night.mood.charAt(0).toUpperCase() + night.mood.slice(1)}
                        </p>
                      </div>
                    )}

                    {/* Session Time */}
                    {night.startTime && night.endTime && (
                      <div className="flex justify-between items-center">
                        <p className="font-body text-xs text-gray-600">Time</p>
                        <p className="font-display text-sm text-white">{night.startTime} - {night.endTime}</p>
                      </div>
                    )}

                    {/* Narrative */}
                    {night.narrative && (
                      <div className="border-t border-quest-border pt-2 mt-2">
                        <p className="font-body text-xs text-gray-500 italic leading-relaxed">
                          "{night.narrative}"
                        </p>
                      </div>
                    )}

                    {/* Semester */}
                    {night.semester && (
                      <div className="text-center pt-2 border-t border-quest-border">
                        <p className="font-display text-[10px] text-gray-700 uppercase tracking-widest">
                          {night.semester}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      {filteredNights.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-quest-border mt-4">
          <div className="text-center">
            <p className="font-display text-xl font-black text-quest-gold">{filteredNights.length}</p>
            <p className="font-body text-[10px] text-gray-600">Games</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-black text-blue-400">
              {filteredNights.reduce((sum, n) => sum + (n.questsCompleted || 0), 0)}
            </p>
            <p className="font-body text-[10px] text-gray-600">Missions</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-black text-yellow-400">
              +{filteredNights.reduce((sum, n) => sum + (n.xpEarned || 0), 0)}
            </p>
            <p className="font-body text-[10px] text-gray-600">Total XP</p>
          </div>
        </div>
      )}
    </div>
  )
}
