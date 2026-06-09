import { useState, useMemo } from 'react'
import {
  BookOpen, Trophy, Stamp, ChevronDown, ChevronUp,
  Trash2, Plus, Star, Crown, Users, Map, Flame,
  CalendarDays, TrendingUp, Award, Gift,
} from 'lucide-react'
import { useMemories }   from '../hooks/useMemories'
import { useLoyalty }    from '../hooks/useLoyalty'
import { GROUP_CHALLENGES, LOYALTY_PERKS } from '../data/quizData'
import { VENUES }        from '../data/venues'

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const d = Date.now() - ts
  const m = Math.floor(d / 60000), h = Math.floor(d / 3600000)
  const days = Math.floor(d / 86400000)
  if (m < 2)   return 'just now'
  if (h < 1)   return `${m}m ago`
  if (days < 1) return `${h}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const MOOD_COLORS = {
  quiet:     'text-gray-500',
  good:      'text-blue-400',
  great:     'text-quest-gold',
  legendary: 'text-orange-400',
}
const MOOD_LABELS = { quiet: '😴 Quiet', good: '😊 Good', great: '🔥 Great', legendary: '👑 Legendary' }

const RARITY_COLORS = {
  common:    'text-gray-400 border-gray-700',
  rare:      'text-blue-400 border-blue-800',
  epic:      'text-purple-400 border-purple-800',
  legendary: 'text-orange-400 border-orange-800',
}
const TIER_COLORS = {
  bronze: 'text-orange-600 bg-orange-900/20 border-orange-800',
  silver: 'text-gray-400 bg-gray-800/40 border-gray-600',
  gold:   'text-quest-gold bg-quest-gold/10 border-quest-gold-dim',
}

// ─── Sub-tab labels ───────────────────────────────────────────────────────────
const SUB_TABS = [
  { id: 'recap',      label: 'Recap',      Icon: BookOpen     },
]

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-quest-gold' }) {
  return (
    <div className="bg-quest-panel border border-quest-border rounded-xl p-3 flex flex-col gap-0.5">
      <Icon size={14} className={color} />
      <p className={`font-display text-lg font-black ${color}`}>{value}</p>
      <p className="font-display text-[9px] uppercase tracking-wider text-gray-500">{label}</p>
      {sub && <p className="font-body text-[10px] text-gray-700">{sub}</p>}
    </div>
  )
}

// ─── Night entry card ─────────────────────────────────────────────────────────
function NightCard({ night, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-quest-panel border border-quest-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-3 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xs font-bold text-gray-200">{night.date}</span>
            <span className={`text-[10px] font-display font-bold ${MOOD_COLORS[night.mood] || 'text-gray-500'}`}>
              {MOOD_LABELS[night.mood] || night.mood}
            </span>
          </div>
          {night.venues?.length > 0 && (
            <p className="font-body text-[11px] text-gray-500 mt-0.5 truncate">
              {night.venues.join(' → ')}
            </p>
          )}
          <p className="font-body text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-snug">
            {night.narrative}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="font-display text-[10px] text-quest-gold font-bold">+{night.xpEarned} XP</span>
          {expanded ? <ChevronUp size={12} className="text-gray-600" /> : <ChevronDown size={12} className="text-gray-600" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-quest-border/60 pt-2 space-y-2 animate-fade-in">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Venues',  v: night.venues?.length || 0 },
              { label: 'Quests',  v: night.questsCompleted    },
              { label: 'Miles',   v: night.milesWalked?.toFixed(1) || '–' },
            ].map(({ label, v }) => (
              <div key={label} className="bg-quest-bg rounded-lg px-2 py-1.5">
                <p className="font-display text-sm font-black text-gray-200">{v}</p>
                <p className="font-body text-[9px] text-gray-700 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {night.squad?.length > 0 && (
            <p className="text-[11px] font-body text-gray-500">
              <Users size={9} className="inline mr-1" />{night.squad.join(', ')}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-700 font-body">{timeAgo(night.savedAt)}</span>
            <button
              onClick={() => onDelete(night.id)}
              className="flex items-center gap-1 text-[10px] text-red-700 hover:text-red-500 transition-colors font-display"
            >
              <Trash2 size={10} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── RECAP TAB ────────────────────────────────────────────────────────────────
function RecapTab({ liveRecap, stats, onSave, nights }) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Calculate averages
  const avgXP = stats.totalNights > 0 ? Math.round(stats.totalXP / stats.totalNights) : 0
  const avgQuests = stats.totalNights > 0 ? Math.round(stats.totalQuests / stats.totalNights) : 0
  const avgVenues = stats.totalNights > 0 ? (stats.totalVenues / stats.totalNights).toFixed(1) : 0

  return (
    <div className="space-y-4">
      {/* Live recap card */}
      <div className="bg-quest-panel border border-purple-800/40 rounded-2xl p-4 space-y-3"
        style={{ boxShadow: '0 0 20px rgba(124,58,237,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-display text-[10px] uppercase tracking-widest text-green-400">Tonight Live</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-display text-base font-black text-gray-100">{liveRecap.date}</p>
            <span className={`font-display text-xs font-bold ${MOOD_COLORS[liveRecap.mood] || 'text-gray-400'}`}>
              {MOOD_LABELS[liveRecap.mood] || liveRecap.mood}
            </span>
          </div>
          <div className="flex gap-4 text-[11px] font-body text-gray-500">
            <span><Map size={9} className="inline mr-0.5" />{liveRecap.venues?.length || 0} venues</span>
            <span><Trophy size={9} className="inline mr-0.5" />{liveRecap.questsCompleted} quests</span>
            <span><Star size={9} className="inline mr-0.5 text-quest-gold" />+{liveRecap.xpEarned} XP</span>
          </div>
          {liveRecap.venues?.length > 0 && (
            <p className="font-body text-[11px] text-gray-400">
              {liveRecap.venues.join(' → ')}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-widest transition-all btn-press
            ${saved
              ? 'bg-green-900/40 border border-green-700 text-green-400'
              : 'bg-gradient-to-r from-purple-700 to-purple-600 text-white hover:from-purple-600 hover:to-purple-500'}`}
        >
          {saved ? '✓ Night Saved!' : <><Plus size={13} /> Save to Journal</>}
        </button>
      </div>

      {/* All-Time Summary */}
      <div>
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-2">All-Time Summary</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatCard icon={CalendarDays} label="Total Nights"  value={stats.totalNights}  color="text-purple-400" />
          <StatCard icon={Star}          label="Avg XP/Night" value={avgXP} color="text-quest-gold" />
          <StatCard icon={Trophy}        label="Avg Quests"   value={avgQuests} color="text-green-400" />
        </div>
      </div>

      {/* Mission Completions Overview */}
      <div>
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-2">Mission Completions</p>
        {nights && nights.length > 0 ? (
          <div className="space-y-2">
            {[...nights].reverse().map((night) => (
              <div key={night.id} className="bg-quest-panel border border-quest-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-xs font-bold text-gray-200">{night.date}</p>
                    <p className="font-body text-[10px] text-gray-500">{timeAgo(night.savedAt)}</p>
                  </div>
                  <span className={`font-display text-xs font-bold ${MOOD_COLORS[night.mood] || 'text-gray-400'}`}>
                    {MOOD_LABELS[night.mood] || night.mood}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-quest-bg rounded-lg px-2 py-1.5">
                    <p className="font-display font-black text-quest-gold">{night.xpEarned}</p>
                    <p className="font-body text-gray-600 text-[9px]">XP Earned</p>
                  </div>
                  <div className="bg-quest-bg rounded-lg px-2 py-1.5">
                    <p className="font-display font-black text-green-400">{night.questsCompleted}</p>
                    <p className="font-body text-gray-600 text-[9px]">Quests</p>
                  </div>
                  <div className="bg-quest-bg rounded-lg px-2 py-1.5">
                    <p className="font-display font-black text-blue-400">{night.venues?.length || 0}</p>
                    <p className="font-body text-gray-600 text-[9px]">Venues</p>
                  </div>
                </div>
                {night.venues?.length > 0 && (
                  <p className="font-body text-[10px] text-gray-500">
                    {night.venues.join(' → ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen size={24} className="text-gray-800 mx-auto mb-2" />
            <p className="font-display text-xs uppercase tracking-wider text-gray-700">No missions completed yet</p>
            <p className="font-body text-[10px] text-gray-800 mt-1">Complete a quest to see your stats here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── JOURNAL TAB ─────────────────────────────────────────────────────────────
function JournalTab({ bySemester, onDelete, onClear }) {
  const semesters = Object.keys(bySemester).sort().reverse()
  const [openSems, setOpenSems] = useState(new Set(semesters.slice(0, 1)))

  const toggle = (sem) => setOpenSems(prev => {
    const next = new Set(prev)
    next.has(sem) ? next.delete(sem) : next.add(sem)
    return next
  })

  const totalNights = semesters.reduce((s, k) => s + bySemester[k].length, 0)

  if (totalNights === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <BookOpen size={32} className="text-gray-800 mx-auto" />
        <p className="font-display text-xs uppercase tracking-wider text-gray-700">No nights saved yet</p>
        <p className="font-body text-sm text-gray-800">Use the Recap tab to save tonight's adventure.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-[11px] text-gray-600">{totalNights} nights across {semesters.length} semester{semesters.length !== 1 ? 's' : ''}</p>
        {totalNights > 0 && (
          <button
            onClick={() => { if (window.confirm('Clear all journal entries?')) onClear() }}
            className="text-[10px] text-red-800 hover:text-red-600 font-display uppercase tracking-wider transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {semesters.map(sem => (
        <div key={sem}>
          <button
            onClick={() => toggle(sem)}
            className="w-full flex items-center justify-between py-2 px-1"
          >
            <div className="flex items-center gap-2">
              <CalendarDays size={12} className="text-purple-400" />
              <span className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider">{sem}</span>
              <span className="text-[10px] font-body text-gray-600">{bySemester[sem].length} nights</span>
            </div>
            {openSems.has(sem) ? <ChevronUp size={12} className="text-gray-600" /> : <ChevronDown size={12} className="text-gray-600" />}
          </button>
          {openSems.has(sem) && (
            <div className="space-y-2 animate-fade-in">
              {bySemester[sem].map(night => (
                <NightCard key={night.id} night={night} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── CHALLENGES TAB ───────────────────────────────────────────────────────────
const CHALLENGE_RARITY_ORDER = ['legendary', 'epic', 'rare', 'common']

function ChallengeCard({ ch }) {
  const rc = RARITY_COLORS[ch.rarity] || RARITY_COLORS.common
  return (
    <div className={`bg-quest-panel border rounded-xl p-3 space-y-2 ${rc.split(' ')[1] || 'border-quest-border'}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">{ch.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display text-xs font-bold text-gray-100">{ch.title}</p>
            <span className={`text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${rc}`}>
              {ch.rarity}
            </span>
          </div>
          <p className="font-body text-[11px] text-gray-500 mt-0.5 leading-snug">{ch.desc}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3 font-body text-gray-600">
          <span className="flex items-center gap-1"><Users size={9} />{ch.minPlayers}+ players</span>
          {ch.category && <span className="capitalize">{ch.category}</span>}
        </div>
        <span className="font-display font-bold text-quest-gold">+{ch.points.toLocaleString()} pts</span>
      </div>
      {ch.unlocks && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-quest-gold/5 border border-quest-gold-dim/30">
          <Gift size={10} className="text-quest-gold flex-shrink-0" />
          <p className="text-[10px] font-body text-quest-gold/80">{ch.unlocks}</p>
        </div>
      )}
    </div>
  )
}

function ChallengesTab() {
  const [filter, setFilter] = useState('all')
  const categories = ['all', 'exploration', 'social', 'coordination', 'performance', 'safety', 'achievement', 'challenge', 'discovery']

  const visible = useMemo(() => {
    const list = filter === 'all'
      ? GROUP_CHALLENGES
      : GROUP_CHALLENGES.filter(c => c.category === filter)
    return [...list].sort((a, b) =>
      CHALLENGE_RARITY_ORDER.indexOf(a.rarity) - CHALLENGE_RARITY_ORDER.indexOf(b.rarity)
    )
  }, [filter])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={12} className="text-quest-gold" />
        <p className="font-body text-[11px] text-gray-500">{GROUP_CHALLENGES.length} group challenges — earn points and unlock venue perks</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-3 py-1 rounded-full border font-display text-[10px] uppercase tracking-wider transition-all btn-press
              ${filter === cat
                ? 'bg-purple-900/40 border-purple-700 text-purple-300'
                : 'bg-quest-panel border-quest-border text-gray-600 hover:text-gray-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map(ch => (
          <ChallengeCard key={ch.id} ch={ch} />
        ))}
      </div>
    </div>
  )
}

// ─── LOYALTY TAB ──────────────────────────────────────────────────────────────
function StampDots({ filled, total, tier }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i}
          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all
            ${i < filled
              ? tier === 'gold'   ? 'bg-quest-gold/30 border-quest-gold text-quest-gold'
              : tier === 'silver' ? 'bg-gray-600/30 border-gray-400 text-gray-300'
                                  : 'bg-orange-700/30 border-orange-600 text-orange-400'
              : 'bg-quest-bg border-gray-800 text-transparent'}`}
        >
          {i < filled ? '✦' : '·'}
        </div>
      ))}
    </div>
  )
}

function LoyaltyCard({ card, onAddStamp, onAcknowledge }) {
  const venue = VENUES.find(v => v.id === card.venueId)
  if (!venue) return null
  const tc = TIER_COLORS[card.tier] || TIER_COLORS.bronze

  return (
    <div className={`bg-quest-panel border rounded-xl p-3 space-y-2 ${card.isComplete ? 'border-quest-gold-dim' : 'border-quest-border'}`}>
      {card.newPerkEarned && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-quest-gold/10 border border-quest-gold-dim/50 animate-fade-in">
          <span className="text-sm">🎉</span>
          <p className="font-display text-[10px] text-quest-gold font-bold">Perk unlocked!</p>
          <button onClick={() => onAcknowledge(card.venueId)} className="ml-auto text-gray-600 hover:text-gray-400 text-xs">✕</button>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-xs font-bold text-gray-100">{venue.name}</p>
          <p className="font-body text-[10px] text-gray-600">{venue.neighborhood}</p>
        </div>
        <span className={`text-[9px] font-display uppercase tracking-wider px-2 py-0.5 rounded-full border ${tc}`}>
          {card.tier}
        </span>
      </div>

      <StampDots filled={Math.min(card.stamps, card.stampsNeeded)} total={card.stampsNeeded} tier={card.tier} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-body text-gray-500">
          <Gift size={9} />
          <span className={card.isComplete ? 'text-quest-gold font-display font-bold' : ''}>{card.perk}</span>
        </div>
        <span className="font-display text-[9px] text-gray-700">{card.stamps}/{card.stampsNeeded}</span>
      </div>

      {card.isComplete && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-quest-gold/10 border border-quest-gold-dim/30">
          <Award size={11} className="text-quest-gold" />
          <p className="text-[10px] font-display text-quest-gold font-bold">Perk Ready — Show at venue</p>
        </div>
      )}

      {/* Demo: manual stamp button (in real app, triggered by check-in) */}
      {!card.isComplete && (
        <button
          onClick={() => onAddStamp(card.venueId)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-quest-border text-[10px] font-display uppercase tracking-widest text-gray-600 hover:text-gray-400 hover:border-gray-600 transition-all btn-press"
        >
          <Stamp size={10} /> Add Stamp
        </button>
      )}
    </div>
  )
}

function LoyaltyTab({ loyalty }) {
  const { allCards, activeCards, totalStamps, totalPerksEarned, addStamp, acknowledgeNewPerk } = loyalty
  const hasProgram = allCards.length > 0
  const [showAll, setShowAll] = useState(false)
  const displayCards = showAll ? allCards : (activeCards.length > 0 ? activeCards : allCards.slice(0, 4))

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={Stamp}  label="Stamps" value={totalStamps}     color="text-quest-gold" />
        <StatCard icon={Gift}   label="Perks"  value={totalPerksEarned} color="text-green-400" />
        <StatCard icon={Star}   label="Venues" value={allCards.length}  color="text-purple-400" />
      </div>

      {hasProgram ? (
        <>
          <p className="font-body text-[11px] text-gray-600">
            Earn stamps by checking into partner venues. Redeem perks in person.
          </p>
          <div className="space-y-2">
            {displayCards.map(card => (
              <LoyaltyCard
                key={card.venueId}
                card={card}
                onAddStamp={addStamp}
                onAcknowledge={acknowledgeNewPerk}
              />
            ))}
          </div>
          {!showAll && allCards.length > displayCards.length && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-[10px] text-gray-600 hover:text-gray-400 font-display uppercase tracking-wider transition-colors"
            >
              Show all {allCards.length} venues <ChevronDown size={10} className="inline" />
            </button>
          )}
        </>
      ) : (
        <p className="text-center font-body text-sm text-gray-700 py-6">No partner venues yet.</p>
      )}
    </div>
  )
}

// ─── MAIN NightsHub ───────────────────────────────────────────────────────────
export default function NightsHub({ loyalty }) {
  const [subTab, setSubTab] = useState('recap')
  const { nights, bySemester, stats, liveRecap, saveNight, deleteNight, clearAll } = useMemories()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-lg font-black text-shimmer">Nights</h2>
        <p className="font-body text-[10px] text-gray-700 uppercase tracking-widest mt-0.5">
          Overview
        </p>
      </div>

      {/* Sub-tab nav */}
      <div className="flex bg-quest-panel border border-quest-border rounded-xl p-1 gap-0.5">
        {SUB_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg font-display text-[9px] uppercase tracking-widest font-bold transition-all duration-200 btn-press
              ${subTab === id
                ? 'bg-gradient-to-b from-quest-gold/20 to-quest-gold/5 text-quest-gold border border-quest-gold/20'
                : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {subTab === 'recap' && (
        <RecapTab liveRecap={liveRecap} stats={stats} onSave={saveNight} nights={nights} />
      )}
      {subTab === 'journal' && (
        <JournalTab bySemester={bySemester} onDelete={deleteNight} onClear={clearAll} />
      )}
      {subTab === 'challenges' && (
        <ChallengesTab />
      )}
      {subTab === 'loyalty' && (
        <LoyaltyTab loyalty={loyalty} />
      )}
    </div>
  )
}
