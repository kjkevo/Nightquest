import { useState, useCallback, useRef, useEffect } from 'react'
import { Moon, Sword, Users, CalendarDays, Sun, Puzzle, BookOpen, Compass, Shield } from 'lucide-react'

import ParticleField  from './components/ParticleField'
import LevelUpModal   from './components/LevelUpModal'
import QuestMode      from './components/QuestMode'
import SquadMode      from './components/SquadMode'
import CustomMode     from './components/CustomMode'
import NightPlanner   from './components/NightPlanner'
import NightsHub      from './components/NightsHub'
import VenueFeed      from './components/VenueFeed'
import SafetyHub      from './components/SafetyHub'
import ResumeTab      from './components/ResumeTab'
import NotFound       from './components/NotFound'
import { useGameState }  from './hooks/useGameState'
import { useTheme }      from './hooks/useTheme'
import { useNetwork }    from './hooks/useNetwork'
import { useMemories }   from './hooks/useMemories'
import { getLevelInfo }  from './data/quests'
import { getPlanParam }  from './hooks/usePlanner'

const TAB_ORDER = ['quests', 'squad', 'resume', 'plan', 'nights']

// ─── XP Bar ───────────────────────────────────────────────────────────────────
function XPBar({ levelInfo }) {
  const { level, title, progress, xpIntoLevel, xpForNextLevel, next, totalXP } = levelInfo
  return (
    <div className="bg-quest-panel border border-quest-border rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-quest-gold/20 border border-quest-gold-dim/40 flex items-center justify-center">
            <span className="font-display text-xs font-black text-quest-gold">{level}</span>
          </div>
          <div>
            <p className="font-display text-xs font-bold text-gray-200 leading-none">{title}</p>
            <p className="font-body text-[10px] text-gray-600 mt-0.5">
              {next ? `${xpIntoLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP` : 'MAX LEVEL'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xs font-bold text-quest-gold">{totalXP.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600 font-body uppercase tracking-wider">Total XP</p>
        </div>
      </div>
      <div className="relative h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgb(var(--nq-gold-dim)), rgb(var(--nq-gold)), #ffe9a0)',
            boxShadow: '0 0 8px rgba(240,192,96,0.5)',
          }} />
      </div>
      {next && (
        <p className="text-[10px] text-gray-700 font-display uppercase tracking-wider mt-1.5 text-right">
          Next: {next.title}
        </p>
      )}
    </div>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button onClick={onToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 rounded-full flex items-center justify-center border border-quest-border bg-quest-panel hover:border-quest-gold-dim hover:text-quest-gold text-gray-600 transition-all btn-press">
      {isDark ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ tab, onChange, hasActiveGame }) {
  const tabs = [
    { id: 'quests', label: 'Quest',  Icon: Sword        },
    { id: 'squad',  label: 'Squad',  Icon: Users        },
    { id: 'resume', label: 'Resume', Icon: Compass, badge: hasActiveGame },
    { id: 'plan',   label: 'Plan',   Icon: CalendarDays },
    { id: 'nights', label: 'Nights', Icon: BookOpen     },
  ]
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-quest-bg border-t border-quest-border"
      style={{ boxShadow: '0 -4px 40px rgba(0,0,0,0.6)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-lg mx-auto flex h-[72px]">
        {tabs.map(({ id, label, Icon, badge }) => (
          <button key={id} onClick={() => onChange(id)}
            className={`relative flex-1 h-full flex flex-col items-center justify-center gap-1.5 font-display text-[10px] uppercase tracking-widest font-bold transition-all duration-200 btn-press
              ${tab === id
                ? 'text-quest-gold'
                : 'text-gray-600 hover:text-gray-400'}`}>
            {tab === id && (
              <span className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-quest-gold" />
            )}
            <div className="relative">
              <Icon size={22} />
              {badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-quest-gold animate-pulse" />
              )}
            </div>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Offline Banner ───────────────────────────────────────────────────────────
function OfflineBanner({ online, wasOffline, onDismiss }) {
  if (online && !wasOffline) return null
  return (
    <div className={`fixed top-0 inset-x-0 z-[60] flex items-center justify-between px-4 py-2 text-xs font-display uppercase tracking-widest ${online ? 'bg-green-900/90 text-green-300' : 'bg-red-900/90 text-red-300'}`}>
      <span>{online ? '✓ Back Online' : '⚡ Offline Mode'}</span>
      {online && wasOffline && <button onClick={onDismiss} className="text-green-500 hover:text-green-200">✕</button>}
    </div>
  )
}

// ─── Plan Tab — sub-nav: Plan · Explore · Safety · Custom ────────────────────
const PLAN_SUB_TABS = [
  { id: 'plan',    label: 'Plan',    Icon: CalendarDays },
  { id: 'explore', label: 'Explore', Icon: Compass      },
  { id: 'safety',  label: 'Safety',  Icon: Shield       },
  { id: 'custom',  label: 'Custom',  Icon: Puzzle       },
]

function PlanTab({ onComplete }) {
  const [sub,          setSub]          = useState('plan')
  const [pendingVenue, setPendingVenue] = useState(null)

  // When a venue is added from Explore, switch to Plan and hand it to NightPlanner
  const handleAddToPlan = (venue) => {
    setPendingVenue(venue)
    setSub('plan')
  }

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex bg-quest-panel border border-quest-border rounded-xl p-1 gap-1">
        {PLAN_SUB_TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setSub(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-display text-[10px] uppercase tracking-widest font-bold transition-all btn-press ${
              sub === id
                ? 'bg-quest-gold/15 text-quest-gold border border-quest-gold/20'
                : 'text-gray-600 hover:text-gray-400'
            }`}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {sub === 'plan'    && <NightPlanner pendingVenue={pendingVenue} onPendingConsumed={() => setPendingVenue(null)} />}
      {sub === 'explore' && <VenueFeed onAddToPlan={handleAddToPlan} />}
      {sub === 'safety'  && <SafetyHub />}
      {sub === 'custom'  && <CustomMode onComplete={onComplete} />}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // 404 guard — unknown paths
  if (window.location.pathname !== '/') return <NotFound />

  const { totalXP, levelInfo, levelUpData, dismissLevelUp, completeQuest } = useGameState()
  const { isDark, toggleTheme } = useTheme()
  const { online, wasOffline, dismissReconnect } = useNetwork()
  const { addSessionXP } = useMemories()

  // Track active games
  const [activeGame, setActiveGame] = useState(null)

  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('r'))    return 'squad'   // squad room invite
    if (params.has('plan')) return 'plan'    // shared itinerary link
    const p = params.get('tab')
    // Back-compat redirects
    if (p === 'planner' || p === 'custom' || p === 'safety' || p === 'explore') return 'plan'
    if (p === 'journal' || p === 'history' || p === 'recap') return 'nights'
    return TAB_ORDER.includes(p) ? p : 'quests'
  })

  // Update theme-color meta on theme change
  useEffect(() => {
    const meta = document.getElementById('theme-color-meta')
    if (meta) meta.setAttribute('content', isDark ? '#0a0a0f' : '#f0ece4')
  }, [isDark])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  // Swipe navigation
  const touchStartX  = useRef(null)
  const touchStartY  = useRef(null)
  const touchStartTab = useRef(null)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current   = e.touches[0].clientX
    touchStartY.current   = e.touches[0].clientY
    touchStartTab.current = tab
  }, [tab])

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const idx = TAB_ORDER.indexOf(touchStartTab.current)
      if (dx > 0 && idx < TAB_ORDER.length - 1) setTab(TAB_ORDER[idx + 1])
      if (dx < 0 && idx > 0) setTab(TAB_ORDER[idx - 1])
    }
    touchStartX.current = null
  }, [])

  // Quest complete handler — updates global XP + session XP
  const handleComplete = useCallback((quest) => {
    const xp = quest.xp || quest.points || 0
    completeQuest({ ...quest, xp })
    addSessionXP(xp)
  }, [completeQuest, addSessionXP])

  return (
    <div className="min-h-screen bg-quest-bg text-white relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>

      <ParticleField />
      {levelUpData && <LevelUpModal levelInfo={levelUpData} onDismiss={dismissLevelUp} />}
      <OfflineBanner online={online} wasOffline={wasOffline} onDismiss={dismissReconnect} />

      <div className={`relative z-10 flex flex-col min-h-screen ${(!online || wasOffline) ? 'pt-9' : ''}`}>

        {/* Header */}
        <header className="pt-5 pb-2 px-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-900 to-quest-bg border-2 border-purple-700/60 flex items-center justify-center"
                style={{ boxShadow: '0 0 18px rgba(124,58,237,0.5)' }}>
                <Moon size={16} className="text-purple-300" />
              </div>
              <div>
                <h1 className="font-display text-xl font-black tracking-tight text-shimmer leading-none">NightQuest</h1>
                <p className="font-body text-[9px] text-gray-600 uppercase tracking-[0.25em]">Conquer the Night</p>
              </div>
            </div>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col gap-4 px-4 pt-2 pb-28 max-w-lg mx-auto w-full overflow-y-auto">
          <XPBar levelInfo={levelInfo} />

          {tab === 'quests' && <QuestMode onComplete={handleComplete} totalXP={totalXP} onGameStart={(gameData) => { setActiveGame({ mode: 'quest', ...gameData }); setTab('resume') }} />}
          {tab === 'squad'  && <SquadMode onComplete={handleComplete} totalXP={totalXP} onGameStart={(gameData) => { setActiveGame({ mode: 'squad', ...gameData }); setTab('resume') }} />}
          {tab === 'resume' && <ResumeTab activeGame={activeGame} onResumeQuest={() => setTab('quests')} onResumeSquad={() => setTab('squad')} onQuitGame={() => setActiveGame(null)} />}
          {tab === 'plan'   && <PlanTab  onComplete={handleComplete} />}
          {tab === 'nights' && <NightsHub />}
        </main>
      </div>

      <BottomNav tab={tab} onChange={setTab} hasActiveGame={!!activeGame} />
    </div>
  )
}
