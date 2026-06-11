import { useState, useMemo } from 'react'
import {
  User, Trophy, Zap, MapPin, Flame, Calendar, BookOpen,
  ChevronDown, ChevronUp, Trash2, Settings, LogOut,
} from 'lucide-react'
import { useMemories } from '../hooks/useMemories'
import { getLevelInfo } from '../data/quests'
import IdentitySection from './IdentitySection'
import RankProgressionSection from './RankProgressionSection'
import StatsDashboard from './StatsDashboard'

// ── Helper functions ──────────────────────────────────────────────────────────
function timeAgo(ts) {
  const d = Date.now() - ts
  const m = Math.floor(d / 60000), h = Math.floor(d / 3600000)
  const days = Math.floor(d / 86400000)
  if (m < 2) return 'just now'
  if (h < 1) return `${m}m ago`
  if (days < 1) return `${h}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const MOOD_COLORS = {
  quiet: 'text-gray-500',
  good: 'text-blue-400',
  great: 'text-quest-gold',
  legendary: 'text-orange-400',
}
const MOOD_LABELS = { quiet: '😴 Quiet', good: '😊 Good', great: '🔥 Great', legendary: '👑 Legendary' }

// ─── Profile Header ────────────────────────────────────────────────────────────
function ProfileHeader({ stats, levelInfo }) {
  return (
    <div className="rounded-2xl border-2 border-quest-gold/30 bg-quest-panel p-6 space-y-4"
      style={{ boxShadow: '0 0 20px rgba(240,192,96,0.08)' }}>

      {/* Level & Title */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-quest-gold/10 border-2 border-quest-gold flex items-center justify-center">
          <span className="font-display text-3xl font-black text-quest-gold">{levelInfo.level}</span>
        </div>
        <div className="flex-1">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-quest-gold">Level {levelInfo.level}</p>
          <p className="font-display text-xl font-black text-white">{levelInfo.title}</p>
          <p className="font-body text-xs text-gray-500 mt-1">{stats.totalNights} nights played</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-quest-bg rounded-lg p-3 border border-quest-border">
          <Zap size={14} className="text-quest-gold mb-1" />
          <p className="font-display text-lg font-black text-quest-gold">{stats.totalXP.toLocaleString()}</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">Total XP</p>
        </div>
        <div className="bg-quest-bg rounded-lg p-3 border border-quest-border">
          <Trophy size={14} className="text-amber-400 mb-1" />
          <p className="font-display text-lg font-black text-amber-400">{stats.legendaryNights}</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">Legendary Nights</p>
        </div>
        <div className="bg-quest-bg rounded-lg p-3 border border-quest-border">
          <MapPin size={14} className="text-blue-400 mb-1" />
          <p className="font-display text-lg font-black text-blue-400">{stats.totalVenues}</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">Unique Venues</p>
        </div>
        <div className="bg-quest-bg rounded-lg p-3 border border-quest-border">
          <Flame size={14} className="text-orange-400 mb-1" />
          <p className="font-display text-lg font-black text-orange-400">{stats.totalQuests}</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">Quests Done</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="font-display text-xs uppercase tracking-widest text-gray-400">Next Level</p>
          <p className="font-display text-xs font-bold text-gray-500">{levelInfo.xpIntoLevel.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()}</p>
        </div>
        <div className="relative h-2 bg-gray-800/80 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${levelInfo.progress}%`,
              background: 'linear-gradient(90deg, rgb(var(--nq-gold-dim)), rgb(var(--nq-gold)), #ffe9a0)',
              boxShadow: '0 0 8px rgba(240,192,96,0.5)',
            }} />
        </div>
      </div>
    </div>
  )
}

// ─── Night Card ────────────────────────────────────────────────────────────────
function NightCard({ night, onDelete }) {
  return (
    <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-display text-sm font-bold text-white">{night.date}</p>
          <p className="font-body text-xs text-gray-500 mt-1">{timeAgo(night.savedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-display text-lg ${MOOD_COLORS[night.mood]}`}>
            {MOOD_LABELS[night.mood]}
          </span>
          <button onClick={() => onDelete(night.id)}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-900/10 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Night Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-quest-bg rounded p-2">
          <p className="font-display text-sm font-bold text-quest-gold">{night.questsCompleted}</p>
          <p className="font-body text-[9px] text-gray-500">Quests</p>
        </div>
        <div className="bg-quest-bg rounded p-2">
          <p className="font-display text-sm font-bold text-blue-400">+{night.xpEarned}</p>
          <p className="font-body text-[9px] text-gray-500">XP</p>
        </div>
        <div className="bg-quest-bg rounded p-2">
          <p className="font-display text-sm font-bold text-amber-400">{night.venues.length}</p>
          <p className="font-body text-[9px] text-gray-500">Venues</p>
        </div>
      </div>

      {/* Narrative */}
      <p className="font-body text-xs text-gray-400 leading-relaxed italic">
        {night.narrative}
      </p>
    </div>
  )
}

// ─── Main ProfileTab ────────────────────────────────────────────────────────────
export default function ProfileTab({ totalXP }) {
  const { nights, stats, bySemester, saveNight, deleteNight, clearAll } = useMemories()
  const [expandedSemester, setExpandedSemester] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const levelInfo = getLevelInfo(totalXP)

  const semesters = Object.keys(bySemester).sort().reverse()

  return (
    <div className="space-y-6 pb-4">
      {/* Identity Section */}
      <IdentitySection totalXP={totalXP} />

      {/* Rank & Progression Section */}
      <RankProgressionSection totalXP={totalXP} />

      {/* Stats Dashboard */}
      <StatsDashboard />

      {/* Profile Header */}
      <ProfileHeader stats={stats} levelInfo={levelInfo} />

      {/* Nights History */}
      <div>
        <h2 className="font-display text-lg font-black text-white mb-4">
          <BookOpen size={16} className="inline mr-2" />
          Nights Played
        </h2>

        {nights.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={32} className="text-gray-700 mx-auto mb-2" />
            <p className="font-display text-sm text-gray-500">No nights recorded yet</p>
            <p className="font-body text-xs text-gray-600 mt-1">Complete a quest to log your night</p>
          </div>
        ) : (
          <div className="space-y-4">
            {semesters.map(semester => (
              <div key={semester}>
                <button
                  onClick={() => setExpandedSemester(e => e === semester ? null : semester)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-quest-panel border border-quest-border hover:border-quest-gold-dim transition-colors mb-2">
                  <p className="font-display text-sm font-bold text-gray-200">{semester}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs text-gray-500">{bySemester[semester].length} nights</span>
                    {expandedSemester === semester ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {expandedSemester === semester && (
                  <div className="space-y-2 ml-2">
                    {bySemester[semester].map(night => (
                      <NightCard key={night.id} night={night} onDelete={deleteNight} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {nights.length > 0 && (
        <div className="border-t border-quest-border pt-4">
          {showClearConfirm ? (
            <div className="space-y-2">
              <p className="font-body text-sm text-gray-400 text-center">Clear all nights data? This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="py-2 rounded-lg border border-quest-border font-display text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-300 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearAll()
                    setShowClearConfirm(false)
                  }}
                  className="py-2 rounded-lg border border-red-900/40 font-display text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">
                  Clear All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-900/40 font-display text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors">
              <Trash2 size={13} /> Clear History
            </button>
          )}
        </div>
      )}
    </div>
  )
}
