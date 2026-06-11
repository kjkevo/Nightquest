import { useState } from 'react'
import { Trophy, Zap, ChevronDown, ChevronUp, Target, Star } from 'lucide-react'
import { LEVELS, getLevelInfo } from '../data/quests'

// Rank emojis and descriptions
const RANK_DETAILS = {
  'Barfly': { emoji: '🍺', color: '#6b7280', desc: 'You\'ve found your spot. Every night starts here.' },
  'Nightcrawler': { emoji: '🦇', color: '#3b82f6', desc: 'Moving between venues like you own the night.' },
  'Social Rogue': { emoji: '🎭', color: '#8b5cf6', desc: 'Conversations flow effortlessly around you.' },
  'Chaos Agent': { emoji: '💥', color: '#ec4899', desc: 'Energy follows you. Things happen when you arrive.' },
  'Party Paladin': { emoji: '⚔️', color: '#f59e0b', desc: 'Defender of good vibes. Leader by nature.' },
  'Quest Champion': { emoji: '👑', color: '#f0c000', desc: 'You\'ve conquered the challenge. Respect earned.' },
  'Night Legend': { emoji: '⭐', color: '#fbbf24', desc: 'Stories will be told about your nights.' },
  'Mythic Reveler': { emoji: '🌙', color: '#a78bfa', desc: 'Transcended the ordinary. Living in legend.' },
  'Ascended Soul': { emoji: '✨', color: '#c084fc', desc: 'Beyond mortal nightlife. Becoming eternal.' },
  'Eternal Quester': { emoji: '👑✨', color: '#fbbf24', desc: 'The ultimate. The absolute pinnacle of the night.' },
}

export default function RankProgressionSection({ totalXP }) {
  const [showFullLadder, setShowFullLadder] = useState(false)
  const levelInfo = getLevelInfo(totalXP)
  const rankDetails = RANK_DETAILS[levelInfo.title] || RANK_DETAILS['Barfly']

  return (
    <div className="space-y-4">
      {/* Current Rank Badge */}
      <div className="rounded-2xl border-2 border-quest-gold/30 bg-quest-panel p-6 space-y-4"
        style={{ boxShadow: '0 0 20px rgba(240,192,96,0.08)' }}>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={20} className="text-quest-gold" />
          <h3 className="font-display text-lg font-bold text-white">Rank & Progression</h3>
        </div>

        {/* Current Rank Display */}
        <div className="text-center space-y-3">
          {/* Rank Emoji - Large */}
          <div className="text-7xl">{rankDetails.emoji}</div>

          {/* Rank Title */}
          <div>
            <p className="font-display text-sm uppercase tracking-widest text-quest-gold mb-1">Current Rank</p>
            <p className="font-display text-3xl font-black text-white">{levelInfo.title}</p>
            <p className="font-display text-xs font-bold mt-1" style={{ color: rankDetails.color }}>
              LEVEL {levelInfo.level} / 10
            </p>
          </div>

          {/* Rank Description */}
          <p className="font-body text-sm text-gray-400 italic max-w-xs mx-auto">
            "{rankDetails.desc}"
          </p>
        </div>

        {/* XP Progress */}
        <div className="space-y-3 pt-4 border-t border-quest-border">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-quest-gold" />
                <p className="font-display text-xs uppercase tracking-widest text-gray-400">XP Progress</p>
              </div>
              <p className="font-display text-xs font-bold text-quest-gold">
                {levelInfo.xpIntoLevel.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()}
              </p>
            </div>
            <div className="relative h-3 bg-gray-800/80 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${levelInfo.progress}%`,
                  background: `linear-gradient(90deg, rgb(var(--nq-gold-dim)), rgb(var(--nq-gold)), #ffe9a0)`,
                  boxShadow: '0 0 12px rgba(240,192,96,0.6)',
                }} />
            </div>
          </div>

          {/* Total XP */}
          <div className="bg-quest-bg rounded-lg p-3 border border-quest-border">
            <p className="font-display text-xs uppercase tracking-widest text-gray-500 mb-1">Total XP Earned</p>
            <p className="font-display text-2xl font-black text-quest-gold">
              {levelInfo.totalXP.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Next Rank Preview */}
        {levelInfo.next && (
          <div className="bg-gradient-to-r from-quest-gold/10 to-quest-gold/5 rounded-lg p-4 border border-quest-gold/30 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-quest-gold" />
              <p className="font-display text-xs uppercase tracking-widest text-quest-gold">Next Rank</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-bold text-white">
                  {levelInfo.next.title}
                </p>
                <p className="font-body text-xs text-gray-500 mt-1">
                  {(levelInfo.next.xpRequired - levelInfo.totalXP).toLocaleString()} XP to unlock
                </p>
              </div>
              <div className="text-3xl">
                {RANK_DETAILS[levelInfo.next.title]?.emoji || '?'}
              </div>
            </div>
          </div>
        )}

        {levelInfo.level === 10 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/30 text-center space-y-2">
            <p className="font-display text-sm font-black text-yellow-300">
              🏆 MAXIMUM RANK ACHIEVED 🏆
            </p>
            <p className="font-body text-xs text-gray-400">
              You are the Eternal Quester. The ultimate legend of the night.
            </p>
          </div>
        )}
      </div>

      {/* Full Rank Ladder */}
      <div className="rounded-xl border border-quest-border bg-quest-panel p-4 space-y-3">
        {/* Toggle Button */}
        <button
          onClick={() => setShowFullLadder(!showFullLadder)}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-quest-bg transition-colors">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-quest-gold" />
            <p className="font-display text-sm font-bold text-white">Full Rank Ladder</p>
          </div>
          {showFullLadder ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFullLadder && (
          <div className="space-y-2 pt-2 border-t border-quest-border max-h-96 overflow-y-auto">
            {LEVELS.map((rank, idx) => {
              const isCurrentRank = levelInfo.level === rank.level
              const isCompleted = levelInfo.level > rank.level
              const rankInfo = RANK_DETAILS[rank.title]

              return (
                <div
                  key={rank.level}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrentRank
                      ? 'bg-quest-gold/10 border-quest-gold ring-1 ring-quest-gold/50'
                      : isCompleted
                      ? 'bg-green-900/10 border-green-800/30'
                      : 'bg-gray-800/30 border-gray-700/30'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{rankInfo.emoji}</span>
                        <div>
                          <p className={`font-display text-sm font-bold ${
                            isCurrentRank ? 'text-quest-gold' : isCompleted ? 'text-green-400' : 'text-gray-300'
                          }`}>
                            {rank.title}
                          </p>
                          <p className="font-body text-[10px] text-gray-500">
                            Level {rank.level}
                          </p>
                        </div>
                      </div>
                      <p className="font-body text-xs text-gray-500 italic mt-1 line-clamp-2">
                        {rankInfo.desc}
                      </p>
                    </div>

                    {/* XP Requirement */}
                    <div className="text-right shrink-0">
                      <p className={`font-display text-xs font-bold ${
                        isCurrentRank ? 'text-quest-gold' : 'text-gray-500'
                      }`}>
                        {rank.xpRequired.toLocaleString()}
                      </p>
                      <p className="font-body text-[10px] text-gray-600">XP</p>

                      {isCurrentRank && (
                        <div className="mt-2 px-2 py-1 rounded bg-quest-gold/20 border border-quest-gold/50">
                          <p className="font-display text-[9px] font-bold text-quest-gold uppercase">Current</p>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="mt-2 px-2 py-1 rounded bg-green-900/30 border border-green-700/50">
                          <p className="font-display text-[9px] font-bold text-green-400 uppercase">✓ Done</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Progression Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-quest-panel border border-quest-border rounded-lg p-3 text-center">
          <Trophy size={14} className="text-quest-gold mx-auto mb-1" />
          <p className="font-display text-sm font-black text-quest-gold">{levelInfo.level}/10</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">Rank Progress</p>
        </div>
        <div className="bg-quest-panel border border-quest-border rounded-lg p-3 text-center">
          <Zap size={14} className="text-yellow-400 mx-auto mb-1" />
          <p className="font-display text-sm font-black text-yellow-400">
            {levelInfo.next ? ((levelInfo.next.xpRequired - levelInfo.totalXP).toLocaleString()) : '∞'}
          </p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">XP Remaining</p>
        </div>
      </div>
    </div>
  )
}
