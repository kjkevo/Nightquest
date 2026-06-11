import { useState } from 'react'
import { Award, Lock, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useBadges } from '../hooks/useBadges'

const RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
}

const RARITY_BG = {
  common: 'bg-gray-800/30 border-gray-700/50',
  rare: 'bg-blue-800/20 border-blue-700/50',
  epic: 'bg-purple-800/20 border-purple-700/50',
  legendary: 'bg-yellow-800/20 border-yellow-700/50',
}

function BadgeCard({ badge, isEarned, isPinned, onTogglePin }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!badge) return null

  return (
    <div
      className={`relative rounded-lg p-3 border transition-all ${
        isEarned
          ? `${RARITY_BG[badge.rarity]} cursor-pointer hover:scale-105`
          : 'bg-gray-900/50 border-gray-800 opacity-60'
      }`}>
      {/* Lock indicator for locked badges */}
      {!isEarned && (
        <div className="absolute top-1 right-1">
          <Lock size={12} className="text-gray-600" />
        </div>
      )}

      {/* Pin indicator for pinned badges */}
      {isPinned && isEarned && (
        <div className="absolute top-1 right-1">
          <Star size={12} className="text-quest-gold fill-quest-gold" />
        </div>
      )}

      {/* Badge Icon */}
      <div className="text-center mb-2">
        <p className={`text-3xl ${!isEarned ? 'opacity-50' : ''}`}>{badge.icon}</p>
      </div>

      {/* Badge Name */}
      <p className={`font-display text-xs font-bold text-center line-clamp-2 ${
        isEarned ? 'text-white' : 'text-gray-600'
      }`}>
        {badge.name}
      </p>

      {/* Badge Rarity */}
      <p className={`font-display text-[9px] text-center uppercase tracking-widest mt-1 ${
        isEarned ? RARITY_COLORS[badge.rarity] : 'text-gray-600'
      }`}>
        {badge.rarity}
      </p>

      {/* Unlock Condition (for locked badges) */}
      {!isEarned && (
        <p className="font-body text-[9px] text-center text-gray-600 mt-2 line-clamp-2">
          {badge.description}
        </p>
      )}

      {/* Unlock Message (for earned badges) */}
      {isEarned && (
        <p className="font-body text-[9px] text-center text-gray-500 italic mt-1 line-clamp-1">
          "{badge.unlockedMessage}"
        </p>
      )}

      {/* Pin Button (only for earned badges) */}
      {isEarned && (
        <button
          onClick={() => onTogglePin(badge.id)}
          className={`w-full mt-2 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
            isPinned
              ? 'bg-quest-gold/20 border border-quest-gold text-quest-gold'
              : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-quest-gold hover:border-quest-gold'
          }`}>
          {isPinned ? '★ PINNED' : 'Pin Badge'}
        </button>
      )}

      {/* Lock message (for locked badges) */}
      {!isEarned && (
        <p className="font-display text-[9px] text-center text-gray-700 mt-2 uppercase tracking-widest">
          🔒 Locked
        </p>
      )}
    </div>
  )
}

export default function AchievementsSection() {
  const { allBadges, earnedBadges, pinnedBadges, isBadgeEarned, togglePinnedBadge, earnedCount, totalCount } = useBadges()
  const [expandedCategory, setExpandedCategory] = useState(null)

  // Organize badges by category
  const categories = {
    Starter: allBadges.filter(b => b.id.includes('first') || b.id.includes('night_owl') || b.id.includes('mission_master')),
    Difficulty: allBadges.filter(b => b.id.includes('easy') || b.id.includes('medium') || b.id.includes('hard')),
    Venues: allBadges.filter(b =>
      b.id.includes('bar') || b.id.includes('club') || b.id.includes('rave') ||
      b.id.includes('open_mic') || b.id.includes('venue')
    ),
    Squad: allBadges.filter(b => b.id.includes('squad') || b.id.includes('solo_artist')),
    Volume: allBadges.filter(b =>
      b.id.includes('quest_warrior') || b.id.includes('night_legend') || b.id.includes('quest_champion')
    ),
    Performance: allBadges.filter(b =>
      b.id.includes('consistent') || b.id.includes('speedster') || b.id.includes('week') || b.id.includes('month')
    ),
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-quest-gold" />
          <h3 className="font-display text-lg font-bold text-white">Achievements & Badges</h3>
        </div>
        <div className="text-right">
          <p className="font-display text-sm font-black text-quest-gold">
            {earnedCount}/{totalCount}
          </p>
          <p className="font-body text-[10px] text-gray-600">Earned</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 bg-quest-panel border border-quest-border rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <p className="font-display text-xs uppercase tracking-widest text-gray-400">Progress</p>
          <p className="font-display text-xs font-bold text-quest-gold">
            {Math.round((earnedCount / totalCount) * 100)}%
          </p>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-quest-gold-dim to-quest-gold transition-all duration-500"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Badge Categories */}
      <div className="space-y-3">
        {Object.entries(categories).map(([category, badges]) => {
          const isExpanded = expandedCategory === category
          const categoryEarnedCount = badges.filter(b => isBadgeEarned(b.id)).length

          return (
            <div key={category} className="bg-quest-panel border border-quest-border rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center justify-between p-3 hover:bg-quest-bg/50 transition-colors">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-bold text-white">{category}</p>
                  <p className="font-display text-xs text-gray-500">
                    ({categoryEarnedCount}/{badges.length})
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Category Badges Grid */}
              {isExpanded && (
                <div className="border-t border-quest-border p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {badges.map(badge => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isEarned={isBadgeEarned(badge.id)}
                        isPinned={pinnedBadges.includes(badge.id)}
                        onTogglePin={togglePinnedBadge}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pinned Badges Showcase */}
      {pinnedBadges.length > 0 && (
        <div className="bg-gradient-to-r from-quest-gold/10 to-quest-gold/5 border-2 border-quest-gold/30 rounded-lg p-4 space-y-3">
          <p className="font-display text-sm font-bold text-quest-gold uppercase tracking-widest">
            ✨ Showcase Badges
          </p>
          <div className="flex justify-around items-end gap-2">
            {[0, 1, 2].map(idx => {
              const badgeId = pinnedBadges[idx]
              const badge = allBadges.find(b => b.id === badgeId)

              if (!badge) {
                return (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-20 rounded-lg bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center">
                      <p className="font-display text-xs text-gray-600">Empty</p>
                    </div>
                    <p className="font-body text-[9px] text-gray-600 mt-1">Slot {idx + 1}</p>
                  </div>
                )
              }

              return (
                <div key={idx} className="text-center">
                  <div className={`w-16 h-20 rounded-lg ${RARITY_BG[badge.rarity]} border-2 border-quest-gold flex flex-col items-center justify-center space-y-1 p-2`}>
                    <p className="text-2xl">{badge.icon}</p>
                    <p className="font-display text-[9px] font-bold text-center line-clamp-2 text-white">
                      {badge.name}
                    </p>
                  </div>
                  <p className="font-body text-[9px] text-gray-600 mt-1">Slot {idx + 1}</p>
                </div>
              )
            })}
          </div>
          <p className="font-body text-[10px] text-gray-500 text-center italic">
            These badges are displayed on your profile header
          </p>
        </div>
      )}

      {/* No badges yet message */}
      {earnedCount === 0 && (
        <div className="text-center py-8">
          <Award size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="font-display text-sm text-gray-500">No badges earned yet</p>
          <p className="font-body text-xs text-gray-600 mt-1">Complete missions to unlock achievements!</p>
        </div>
      )}
    </div>
  )
}
