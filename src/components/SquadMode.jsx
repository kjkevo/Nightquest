import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Users, Swords, LogIn, ChevronLeft, Plus, Minus, Trash2,
  CheckCircle, Circle, ChevronDown, ChevronUp, Copy, Crown,
  RefreshCw, Zap, Trophy, Share2, Link, UserCheck, Hash, UserX,
} from 'lucide-react'
import {
  OUTING_TYPES, DIFFICULTIES,
  pickNQuests, assignPlayersToTasks, squadTaskCount,
  pickDuoQuestSet, pickTrioQuestSet, pickQuadQuestSet, pickPentaQuestSet, pickHexaQuestSet, pickHeptaQuestSet,
  pickOctaQuestSet, pickNonaQuestSet, pickDecaQuestSet,
  pickSquadVenueQuests,
} from '../data/outingQuests'
import { useActiveSession } from '../hooks/useActiveSession'
import { useNightTimer } from '../hooks/useNightTimer'
import { useSquadSync, getSessionKey } from '../hooks/useSquadSync'
import { createRoom, joinByCode, getRoomFromUrl, clearRoomParam, getShareUrl } from '../hooks/useSquadRoom'
import { pickFreshTasks } from '../hooks/useSeenTasks'
import NightComplete from './NightComplete'
import NightTimerBar from './NightTimerBar'
import SquadSyncPanel from './SquadSyncPanel'

// Substitute "Player 1"…"Player 10" with actual names
function subNames(text, players) {
  if (!text || !players?.length) return text
  // Replace longest strings first to avoid partial matches (e.g. "Player 10" before "Player 1")
  return text
    .replace(/Player 10/g, players[9]  || 'Player 10')
    .replace(/Player 9/g,  players[8]  || 'Player 9')
    .replace(/Player 8/g,  players[7]  || 'Player 8')
    .replace(/Player 7/g,  players[6]  || 'Player 7')
    .replace(/Player 6/g,  players[5]  || 'Player 6')
    .replace(/Player 5/g,  players[4]  || 'Player 5')
    .replace(/Player 4/g,  players[3]  || 'Player 4')
    .replace(/Player 3/g,  players[2]  || 'Player 3')
    .replace(/Player 2/g,  players[1]  || 'Player 2')
    .replace(/Player 1/g,  players[0]  || 'Player 1')
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
function saveVS(game) {
  try {
    const all = JSON.parse(localStorage.getItem('nq_vs_games') || '{}')
    all[game.code] = game
    localStorage.setItem('nq_vs_games', JSON.stringify(all))
  } catch {}
}
function loadVS(code) {
  try {
    const all = JSON.parse(localStorage.getItem('nq_vs_games') || '{}')
    return all[code.toUpperCase()] || null
  } catch { return null }
}

// ─── Shared sub-components ────────────────────────────────────────────────────

/**
 * ShareRoomButton — triggers Web Share API on mobile (native share sheet),
 * falls back to clipboard copy on desktop.
 * compact=true renders an icon-only button for tight spaces (banner).
 * compact=false renders a full labelled button for the leaderboard panel.
 */
function ShareRoomButton({ url, code, compact = false }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my NightQuest squad',
          text:  `Room code: ${code} — tap to join the squad`,
          url,
        })
        return
      } catch (e) {
        if (e?.name === 'AbortError') return  // user cancelled — don't fall through
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Final fallback: prompt
      window.prompt('Copy this link to share your squad:', url)
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleShare}
        title={copied ? 'Copied!' : 'Share squad invite link'}
        className="flex items-center gap-1 px-2 py-1 rounded-lg font-display text-[9px] uppercase tracking-widest transition-all btn-press shrink-0"
        style={{
          background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(240,192,96,0.15)',
          color:       copied ? '#4ade80' : '#f0c060',
          border:      copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(240,192,96,0.3)',
        }}>
        {copied
          ? <><CheckCircle size={10} /> Copied</>
          : <><Share2 size={10} /> Invite</>}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all btn-press"
      style={{
        background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(240,192,96,0.10)',
        color:       copied ? '#4ade80' : '#f0c060',
        border:      copied ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(240,192,96,0.25)',
      }}>
      {copied
        ? <><CheckCircle size={13} /> Link copied!</>
        : <><Share2 size={13} /> Invite Friends · {code}</>}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-xl border border-quest-border text-gray-500 hover:text-gray-200 transition-colors">
      <ChevronLeft size={16} />
    </button>
  )
}

function OutingGrid({ onPick }) {
  return (
    <div className="flex flex-col gap-4">
      {OUTING_TYPES.map(o => (
        <button key={o.id} onClick={() => onPick(o)}
          className="min-h-[120px] w-full flex items-center gap-5 px-6 py-5 bg-quest-panel border border-quest-border rounded-2xl hover:border-quest-gold-dim transition-all btn-press text-left">
          <div className="w-20 h-20 rounded-2xl bg-quest-bg border border-quest-border flex items-center justify-center text-4xl shrink-0">{o.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-bold text-white leading-tight">{o.label}</p>
            <p className="font-body text-base text-gray-500 mt-1.5 leading-snug">{o.desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function DiffGrid({ onPick }) {
  return (
    <div className="space-y-3">
      {DIFFICULTIES.map(d => (
        <button key={d.id} onClick={() => onPick(d)}
          className="w-full p-4 rounded-2xl border text-left transition-all btn-press"
          style={{ background: d.bg, borderColor: d.border }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-sm font-black uppercase tracking-wider" style={{ color: d.color }}>{d.label}</span>
            <span className="font-display text-xs font-bold" style={{ color: d.color }}>{d.xpRange[0]}–{d.xpRange[1]} XP ea.</span>
          </div>
          <p className="font-body text-sm text-gray-400">{d.desc}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Task card with assigned players ─────────────────────────────────────────
function TaskCard({ task, index, completed, onComplete, diffColor, players, highlightPlayerIdx }) {
  const [open, setOpen] = useState(false)
  const desc = subNames(task.desc, players)
  const tip  = subNames(task.tip,  players)

  // Highlight the current player's name/label in the description
  function HighlightedDesc({ text }) {
    if (highlightPlayerIdx == null || !text) return <>{text}</>
    const playerLabel = players?.[highlightPlayerIdx] ?? `Player ${highlightPlayerIdx + 1}`
    const genericLabel = `Player ${highlightPlayerIdx + 1}`
    const escaped = [playerLabel, genericLabel]
      .filter(Boolean)
      .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    if (!escaped.length) return <>{text}</>
    const regex = new RegExp(`(${escaped.join('|')})`, 'g')
    const parts = text.split(regex)
    return <>{parts.map((p, i) =>
      regex.test(p)
        ? <strong key={i} className="text-quest-gold font-bold">{p}</strong>
        : <span key={i}>{p}</span>
    )}</>
  }
  return (
    <div className={`rounded-xl border transition-all ${completed ? 'opacity-40 bg-quest-bg border-quest-border/30' : 'bg-quest-panel border-quest-border'}`}>
      <div className="flex items-start gap-3 p-3">
        <button onClick={() => !completed && onComplete(task)} disabled={completed} className="mt-0.5 shrink-0 transition-transform active:scale-90">
          {completed
            ? <CheckCircle size={22} className="text-green-500" />
            : <Circle size={22} className="text-gray-600 hover:text-gray-300 transition-colors" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-display text-sm font-bold leading-snug ${completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <Zap size={10} style={{ color: diffColor }} />
              <span className="font-display text-xs font-black" style={{ color: diffColor }}>{task.xp}</span>
            </div>
          </div>

          {/* Assigned players */}
          {task.assignedPlayers?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.assignedPlayers.map(p => (
                <span key={p} className="font-display text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-800/40 text-purple-300">{p}</span>
              ))}
            </div>
          )}

          {!completed && (
            <button onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1 mt-1.5 text-[10px] font-display uppercase tracking-wider text-gray-600 hover:text-gray-400 transition-colors">
              {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {open ? 'Hide' : 'Details'}
            </button>
          )}
        </div>
      </div>

      {open && !completed && (
        <div className="px-3 pb-3 pl-11 space-y-2 animate-fade-in">
          <p className="font-body text-sm text-gray-300 leading-relaxed">
            <HighlightedDesc text={desc} />
          </p>
          {tip && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-quest-bg border border-quest-border/50">
              <span className="text-xs">💡</span>
              <p className="font-body text-xs text-gray-500 leading-relaxed italic">{tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Active task list (used by both squad + VS) ───────────────────────────────
function ActiveTaskList({ tasks: initialTasks, difficulty, outing, onTaskComplete, onNewGame, onRerollMissions, teamName, players, completedIds: completedIdsProp, xpEarned: xpEarnedProp, totalXP, highlightPlayerIdx, roomCode, roomUrl, roomPlayerCount, hostKey }) {
  // For VS mode no external session management is needed — use local state
  const [localCompletedIds, setLocalCompletedIds] = useState(new Set())
  const [localXpEarned, setLocalXpEarned] = useState(0)
  const popIdRef = useRef(0)
  const [xpPops, setXpPops] = useState([])
  // Defensive force-complete flag — fires instantly on last task click
  const [forceComplete, setForceComplete] = useState(false)
  useEffect(() => { setForceComplete(false) }, [initialTasks])
  const { formatted, phase, phaseIndex, elapsedMinutes, startNight, endNight, PHASES } = useNightTimer()

  useEffect(() => { startNight() }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // If parent supplies completedIds use those (persisted session), otherwise local
  const completedIds = completedIdsProp ?? localCompletedIds
  const xpEarned     = xpEarnedProp    ?? localXpEarned

  const diffCfg = DIFFICULTIES.find(d => d.id === difficulty.id) || DIFFICULTIES[0]
  const done    = completedIds.size
  const total   = initialTasks.length
  const pct     = Math.round((done / total) * 100)

  // ── Real-time squad sync (only active when in a named room) ─────────────────
  const myPlayerName = players?.[highlightPlayerIdx ?? 0] ?? `Player ${(highlightPlayerIdx ?? 0) + 1}`
  const completedArr = Array.from(completedIds)   // stable reference via memo not needed here — hook debounces
  const [wasKicked, setWasKicked] = useState(false)
  const { memberList, syncStatus, myKey, kickMember } = useSquadSync({
    roomCode,
    playerIdx:    highlightPlayerIdx ?? 0,
    playerName:   myPlayerName,
    completedIds: completedArr,
    xpEarned,
    totalTasks:   total,
    enabled:      !!roomCode && !wasKicked,
    onKicked:     () => setWasKicked(true),
  })

  const handleComplete = useCallback((task) => {
    if (!completedIdsProp) {
      // VS / unmanaged path: update local state
      setLocalCompletedIds(prev => new Set([...prev, task.id]))
      setLocalXpEarned(x => x + task.xp)
    }
    // Spawn XP pop
    const id = ++popIdRef.current
    setXpPops(prev => [...prev, { id, value: task.xp }])
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 1050)
    onTaskComplete(task)

    // If this is the LAST task, force the completion screen immediately.
    const projectedDone = new Set([...completedIds, task.id]).size
    if (projectedDone >= initialTasks.length && initialTasks.length > 0) {
      setForceComplete(true)
    }
  }, [completedIdsProp, onTaskComplete, completedIds, initialTasks.length])

  // ── All done → show completion screen ───────────────────────────────────────
  const allDone = forceComplete || (done === total && total > 0)
  if (allDone) {
    return (
      <NightComplete
        outing={outing}
        difficulty={difficulty}
        xpEarned={xpEarned}
        tasksCompleted={Math.max(done, initialTasks.length)}
        totalXP={totalXP}
        // "Same Again" → re-roll fresh missions with same squad if available,
        // otherwise fall back to returning to the menu.
        onPlayAgain={onRerollMissions ?? onNewGame}
        onNewOuting={onNewGame}
        onReturnHome={onNewGame}
      />
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with XP pops */}
      <div className="relative flex items-center gap-3">
        <BackBtn onClick={onNewGame} />
        <div className="flex-1">
          {teamName && <p className="font-display text-[10px] uppercase tracking-widest text-purple-400">{teamName}</p>}
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{outing.emoji} {outing.label}</p>
          <p className="font-display text-sm font-bold uppercase" style={{ color: diffCfg.color }}>{difficulty.label} Mode</p>
        </div>
        <div className="relative text-right">
          <p className="font-display text-lg font-black text-quest-gold">{xpEarned}</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-600">XP earned</p>
          {xpPops.map(pop => (
            <span key={pop.id} className="xp-pop absolute right-0 top-0 font-display text-sm font-black whitespace-nowrap"
              style={{ color: diffCfg.color, textShadow: `0 0 12px ${diffCfg.color}` }}>
              +{pop.value}
            </span>
          ))}
        </div>
      </div>

      {/* Squad Room: "you are Player N" banner + inline share button */}
      {highlightPlayerIdx != null && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-quest-gold/25 animate-fade-in"
          style={{ background: 'rgba(240,192,96,0.07)' }}>
          <UserCheck size={13} className="text-quest-gold shrink-0" />
          <p className="font-display text-xs text-quest-gold font-bold flex-1 min-w-0 truncate">
            You are <span className="font-black">Player {highlightPlayerIdx + 1}</span>
            {players?.[highlightPlayerIdx] && players[highlightPlayerIdx] !== `Player ${highlightPlayerIdx + 1}`
              ? ` · ${players[highlightPlayerIdx]}` : ''}
          </p>
          {roomUrl && <ShareRoomButton url={roomUrl} code={roomCode} compact />}
        </div>
      )}

      {/* "You were removed" banner */}
      {wasKicked && (
        <div className="rounded-xl border border-red-900/50 px-3 py-2.5 flex items-center gap-2 animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <UserX size={13} className="text-red-400 shrink-0" />
          <p className="font-body text-xs text-red-300 flex-1">
            You were removed from the squad room by the host. You can still play solo.
          </p>
          <button onClick={onNewGame}
            className="font-display text-[10px] uppercase tracking-widest text-red-300 hover:text-red-200">
            Leave
          </button>
        </div>
      )}

      {/* Live squad sync panel (only shown in named rooms) */}
      {roomCode && !wasKicked && (
        <SquadSyncPanel
          memberList={memberList}
          myKey={myKey}
          syncStatus={syncStatus}
          roomCode={roomCode}
          diffColor={diffCfg.color}
          roomUrl={roomUrl}
          roomPlayerCount={roomPlayerCount}
          hostKey={hostKey}
          onKick={kickMember}
        />
      )}

      {/* Night timer */}
      <NightTimerBar
        formatted={formatted}
        phase={phase}
        phaseIndex={phaseIndex}
        elapsedMinutes={elapsedMinutes}
        PHASES={PHASES}
        onEndNight={endNight}
      />

      {/* Progress */}
      <div className="bg-quest-panel border border-quest-border rounded-xl px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs uppercase tracking-widest text-gray-500">Progress</span>
          <span className="font-display text-sm font-black text-white">{done}<span className="text-gray-600"> / {total}</span></span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg,${diffCfg.color}88,${diffCfg.color})`,
              boxShadow: `0 0 8px ${diffCfg.color}44`,
            }} />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {initialTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            completed={completedIds.has(task.id)}
            onComplete={handleComplete}
            diffColor={diffCfg.color}
            players={players}
            highlightPlayerIdx={highlightPlayerIdx}
          />
        ))}
      </div>

      {/* Bottom actions — primary re-roll, secondary back-to-menu */}
      <div className="grid grid-cols-3 gap-2">
        {onRerollMissions && (
          <button onClick={onRerollMissions}
            className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-xs font-black uppercase tracking-widest text-quest-bg btn-press transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' }}>
            <RefreshCw size={13} /> New Missions
          </button>
        )}
        <button onClick={onNewGame}
          className={`${onRerollMissions ? '' : 'col-span-3'} flex items-center justify-center gap-1.5 py-3 rounded-xl border border-quest-border font-display text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-300 hover:border-gray-700 transition-all btn-press`}>
          <ChevronLeft size={11} /> Menu
        </button>
      </div>
    </div>
  )
}

// ─── 1. Squad Menu ────────────────────────────────────────────────────────────
function SquadMenu({ onCreateRoom, onCreateSquad, onVSMode, onJoin, pendingRoom }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center pt-2 pb-1">
        <h2 className="font-display text-lg font-black text-white">Squad Mode</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Play together or compete head-to-head</p>
      </div>

      {/* Pending room invite banner */}
      {pendingRoom && (
        <button onClick={onJoin}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-quest-gold/40 animate-fade-in btn-press text-left"
          style={{ background: 'rgba(240,192,96,0.08)' }}>
          <span className="text-xl">🎉</span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xs font-bold text-quest-gold uppercase tracking-wider">Squad Invite Detected</p>
            <p className="font-body text-xs text-gray-500 truncate">
              {OUTING_TYPES.find(o => o.id === pendingRoom.o)?.label ?? 'Squad'} · code {pendingRoom.code}
            </p>
          </div>
          <span className="font-display text-xs text-quest-gold shrink-0">Join →</span>
        </button>
      )}

      {/* Primary: Squad Room (cross-device) */}
      <button onClick={onCreateRoom}
        className="w-full flex items-center gap-4 p-6 bg-quest-panel border-2 border-quest-gold/30 rounded-2xl hover:border-quest-gold/60 transition-all btn-press text-left min-h-[140px]"
        style={{ boxShadow: '0 0 20px rgba(240,192,96,0.08)' }}>
        <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(240,192,96,0.12)', border: '1px solid rgba(240,192,96,0.25)' }}>
          <Share2 size={28} className="text-quest-gold" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-white">Create Squad Room</p>
          <p className="font-body text-sm text-gray-500 mt-1">Share a code — friends join on their own phones</p>
          <span className="inline-block mt-2 font-display text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-quest-gold/10 border border-quest-gold/20 text-quest-gold">Cross-device</span>
        </div>
      </button>

      {/* All other buttons - full width and consistent size */}
      <button onClick={onCreateSquad}
        className="w-full flex items-center gap-4 p-6 bg-quest-panel border border-quest-border rounded-2xl hover:border-quest-gold-dim transition-all btn-press text-left min-h-[120px]">
        <div className="w-14 h-14 rounded-xl bg-quest-gold/10 border border-quest-gold/20 flex items-center justify-center shrink-0">
          <Users size={24} className="text-quest-gold" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-white">Same Device</p>
          <p className="font-body text-sm text-gray-600 mt-1">Pass one phone around and play together</p>
        </div>
      </button>

      <button onClick={onVSMode}
        className="w-full flex items-center gap-4 p-6 bg-quest-panel border border-quest-border rounded-2xl hover:border-red-800/60 transition-all btn-press text-left min-h-[120px]">
        <div className="w-14 h-14 rounded-xl bg-red-900/20 border border-red-800/30 flex items-center justify-center shrink-0">
          <Swords size={24} className="text-red-400" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-white">VS Mode</p>
          <p className="font-body text-sm text-gray-600 mt-1">Compete head-to-head with another team</p>
        </div>
      </button>

      <button onClick={onJoin}
        className="w-full flex items-center gap-4 p-6 bg-quest-panel border border-quest-border rounded-2xl hover:border-purple-800 transition-all btn-press text-left min-h-[120px]">
        <div className="w-14 h-14 rounded-xl bg-purple-900/20 border border-purple-800/30 flex items-center justify-center shrink-0">
          <Hash size={24} className="text-purple-400" />
        </div>
        <div>
          <p className="font-display text-base font-bold text-white">Enter a Code</p>
          <p className="font-body text-sm text-gray-500 mt-1">Join a squad room or VS game with a 6-char code</p>
        </div>
      </button>
    </div>
  )
}

// ─── 2. Squad Builder (group size + names) ────────────────────────────────────
function SquadBuilder({ onConfirm, onBack, minSize = 2, maxSize = 10, mustBeEven = false, title = 'Build Your Squad' }) {
  const [count, setCount]   = useState(minSize)
  const [names, setNames]   = useState(() => Array.from({ length: minSize }, (_, i) => `Player ${i + 1}`))

  const setCount2 = (n) => {
    const clamped = Math.max(minSize, Math.min(maxSize, mustBeEven ? (n % 2 === 0 ? n : n + 1) : n))
    setCount(clamped)
    setNames(prev => {
      const next = [...prev]
      while (next.length < clamped) next.push(`Player ${next.length + 1}`)
      return next.slice(0, clamped)
    })
  }

  const updateName = (i, val) => setNames(prev => prev.map((n, idx) => idx === i ? val : n))

  const valid = names.every(n => n.trim())

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <p className="font-display text-sm font-bold text-white">{title}</p>
      </div>

      {/* Group size picker */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-4">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-3">
          Group Size{mustBeEven ? ' (even numbers only)' : ''}
        </p>
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setCount2(count - (mustBeEven ? 2 : 1))} disabled={count <= minSize}
            className="w-10 h-10 rounded-full border border-quest-border flex items-center justify-center text-gray-400 hover:text-white hover:border-quest-gold-dim disabled:opacity-30 transition-all btn-press">
            <Minus size={16} />
          </button>
          <div className="text-center">
            <p className="font-display text-4xl font-black text-quest-gold">{count}</p>
            <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">players</p>
          </div>
          <button onClick={() => setCount2(count + (mustBeEven ? 2 : 1))} disabled={count >= maxSize}
            className="w-10 h-10 rounded-full border border-quest-border flex items-center justify-center text-gray-400 hover:text-white hover:border-quest-gold-dim disabled:opacity-30 transition-all btn-press">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Player names */}
      <div className="space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 px-1">Player Names</p>
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-2 bg-quest-panel border border-quest-border rounded-xl px-3 py-2.5">
            <span className="font-display text-xs text-gray-600 w-5 shrink-0">{i + 1}.</span>
            <input
              value={name}
              onChange={e => updateName(i, e.target.value)}
              maxLength={20}
              placeholder={`Player ${i + 1}`}
              className="flex-1 bg-transparent border-none outline-none font-display text-sm text-white placeholder-gray-700"
            />
          </div>
        ))}
      </div>

      <button onClick={() => valid && onConfirm(names.map(n => n.trim()))} disabled={!valid}
        className={`w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${valid ? 'bg-gradient-to-r from-purple-700 to-purple-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'}`}
        style={valid ? { boxShadow: '0 0 20px rgba(124,58,237,0.35)' } : {}}>
        Continue →
      </button>
    </div>
  )
}

// ─── 3. Team Name Entry ────────────────────────────────────────────────────────
function TeamNameEntry({ playerCount, onConfirm, onBack, label = 'Your Team Name' }) {
  const [teamName, setTeamName] = useState('')
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <p className="font-display text-sm font-bold text-white">Name Your Team</p>
      </div>
      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{label}</p>
        <input
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          maxLength={30}
          placeholder="e.g. Night Wolves, The Crew, Team Chaos…"
          className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-2.5 font-display text-sm text-white outline-none focus:border-quest-gold-dim transition-colors placeholder-gray-700"
        />
      </div>
      <button onClick={() => teamName.trim() && onConfirm(teamName.trim())}
        disabled={!teamName.trim()}
        className={`w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${teamName.trim() ? 'bg-gradient-to-r from-purple-700 to-purple-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'}`}
        style={teamName.trim() ? { boxShadow: '0 0 20px rgba(124,58,237,0.35)' } : {}}>
        Continue →
      </button>
    </div>
  )
}

// ─── 4. VS Code Share ─────────────────────────────────────────────────────────
function VSCodeShare({ code, teamName, onContinue }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => alert(code))
  }
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center pt-2">
        <div className="text-3xl mb-3">⚔️</div>
        <p className="font-display text-base font-black text-white">{teamName} is ready!</p>
        <p className="font-body text-sm text-gray-500 mt-1">Share this code with the opposing team so they can join</p>
      </div>

      <div className="bg-quest-panel border-2 border-quest-gold/30 rounded-2xl p-5 flex flex-col items-center gap-3"
        style={{ boxShadow: '0 0 30px rgba(240,192,96,0.1)' }}>
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Join Code</p>
        <p className="font-display text-5xl font-black tracking-[0.35em] text-quest-gold select-all">{code}</p>
        <button onClick={copy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-quest-bg border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          {copied ? <><CheckCircle size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy Code</>}
        </button>
      </div>

      <div className="bg-quest-panel border border-quest-border rounded-xl p-4">
        <p className="font-body text-xs text-gray-500 leading-relaxed text-center">
          Once the opposing team has joined using this code, tap below to start your missions. Both teams will get the <span className="text-white">same challenges</span> — first to complete all wins.
        </p>
      </div>

      <button onClick={onContinue}
        className="w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-800 to-red-700 btn-press"
        style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
        Start Our Missions ⚔️
      </button>
    </div>
  )
}

// ─── 5. Join VS Game ──────────────────────────────────────────────────────────
function JoinVSGame({ onJoined, onBack }) {
  const [code, setCode]   = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    const game = loadVS(code)
    if (!game) { setError('No VS game found with that code. Check and try again.'); return }
    onJoined(game, code.toUpperCase())
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <p className="font-display text-sm font-bold text-white">Join VS Game</p>
      </div>

      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Enter the 6-character code</p>
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError('') }}
          placeholder="e.g. ABC123"
          maxLength={6}
          className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-display text-2xl text-center tracking-[0.5em] text-quest-gold outline-none focus:border-quest-gold-dim uppercase transition-colors"
        />
        {error && <p className="font-body text-xs text-red-400 text-center">{error}</p>}
        <button
          onClick={handleJoin} disabled={code.length < 6}
          className={`w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${code.length === 6 ? 'bg-gradient-to-r from-purple-700 to-purple-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'}`}
          style={code.length === 6 ? { boxShadow: '0 0 16px rgba(124,58,237,0.4)' } : {}}>
          <LogIn size={14} className="inline mr-2" /> Join Game
        </button>
      </div>
    </div>
  )
}

// ─── 6. Squad Room — Share screen ─────────────────────────────────────────────
function RoomShareScreen({ code, url, outing, difficulty, playerCount, onStart, onBack }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard?.writeText(url)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
      .catch(() => { try { navigator.clipboard.writeText(code) } catch {} })
  }

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join my NightQuest squad room — ${outing?.emoji} ${outing?.label}`,
        text:  `Room code: ${code}\nJoin here:`,
        url,
      }).catch(() => copy())
    } else {
      copy()
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={onBack} />
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Squad Room</p>
          <p className="font-display text-sm font-bold text-white">{outing?.emoji} {outing?.label} · {difficulty?.label}</p>
        </div>
      </div>

      {/* Code card */}
      <div className="rounded-2xl border-2 p-6 text-center space-y-3"
        style={{ borderColor: 'rgba(240,192,96,0.35)', background: 'rgba(240,192,96,0.05)', boxShadow: '0 0 40px rgba(240,192,96,0.08)' }}>
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-gray-500">Room Code</p>
        <p className="font-display text-6xl font-black tracking-[0.4em] text-quest-gold select-all">{code}</p>
        <p className="font-body text-xs text-gray-500">Up to {playerCount} players · Share this code or the link below</p>
      </div>

      {/* How to join instructions */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-2">How friends join</p>
        {[
          { step: '1', text: 'Tap the Share button below and send them the link' },
          { step: '2', text: 'Or they can go to Squad → Enter a Code → type ' + code },
          { step: '3', text: 'They pick their player number and see the same tasks' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-quest-gold/20 border border-quest-gold/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="font-display text-[9px] font-black text-quest-gold">{step}</span>
            </div>
            <p className="font-body text-xs text-gray-400 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {/* Share / copy row */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={share}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider text-white btn-press transition-all"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
          <Share2 size={13} />
          {navigator.share ? 'Share Link' : 'Copy Link'}
        </button>
        <button onClick={copy}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-quest-border font-display text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          {copied ? <><CheckCircle size={13} className="text-green-400" /> Copied!</> : <><Copy size={13} /> Copy Link</>}
        </button>
      </div>

      {/* Start button */}
      <button onClick={onStart}
        className="w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest btn-press text-quest-bg transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' }}>
        I'm Player 1 — Start Night
      </button>
    </div>
  )
}

// ─── 7. Squad Room — Join screen ───────────────────────────────────────────────
function RoomJoinScreen({ preloadedRoom, onJoined, onBack }) {
  const [code,       setCode]       = useState(preloadedRoom?.code ?? '')
  const [room,       setRoom]       = useState(preloadedRoom ?? null)
  const [playerIdx,  setPlayerIdx]  = useState(0)
  const [name,       setName]       = useState('')
  const [error,      setError]      = useState('')
  const [step,       setStep]       = useState(preloadedRoom ? 'pickPlayer' : 'enterCode')

  const outing     = room ? OUTING_TYPES.find(o => o.id === room.o)  ?? OUTING_TYPES[0] : null
  const difficulty = room ? DIFFICULTIES.find(d => d.id === room.di) ?? DIFFICULTIES[0] : null

  const lookupCode = () => {
    const found = joinByCode(code)
    if (!found) { setError('No squad room found with that code. Check the code and try again.'); return }
    setRoom(found)
    clearRoomParam()
    setStep('pickPlayer')
  }

  const handleStart = () => {
    if (!name.trim()) { setError('Enter your name first'); return }
    onJoined({ room, playerIdx, playerName: name.trim(), outing, difficulty })
  }

  if (step === 'enterCode') {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <BackBtn onClick={onBack} />
          <p className="font-display text-sm font-bold text-white">Enter Room Code</p>
        </div>

        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">6-character code from the room host</p>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError('') }}
            placeholder="e.g. NQ3F7A"
            maxLength={6}
            autoFocus
            className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-display text-3xl text-center tracking-[0.5em] text-quest-gold outline-none focus:border-quest-gold-dim uppercase transition-colors"
          />
          {error && <p className="font-body text-xs text-red-400 text-center">{error}</p>}
          <button
            onClick={lookupCode} disabled={code.length < 6}
            className={`w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${
              code.length === 6 ? 'bg-gradient-to-r from-quest-purple to-indigo-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'
            }`}
            style={code.length === 6 ? { boxShadow: '0 0 16px rgba(124,58,237,0.4)' } : {}}>
            Find Room
          </button>
        </div>

        <p className="font-body text-xs text-gray-600 text-center">
          Ask the room host to share their 6-char code or send you the link directly.
        </p>
      </div>
    )
  }

  // step === 'pickPlayer'
  const playerCount = room?.n ?? 10
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => { setStep('enterCode'); setRoom(null) }} />
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Joining room {room?.code}</p>
          <p className="font-display text-sm font-bold text-white">{outing?.emoji} {outing?.label} · {difficulty?.label}</p>
        </div>
      </div>

      {/* Name */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Your name</p>
        <input
          value={name}
          onChange={e => { setName(e.target.value.slice(0, 20)); setError('') }}
          placeholder="Enter your name…"
          maxLength={20}
          autoFocus
          className="w-full bg-quest-bg border border-quest-border rounded-xl px-3 py-2.5 font-display text-sm text-white outline-none focus:border-quest-gold-dim transition-colors"
        />
      </div>

      {/* Player number picker */}
      <div className="space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Pick your player number</p>
        <p className="font-body text-xs text-gray-600 -mt-1">The task descriptions will refer to you as this player.</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: playerCount }, (_, i) => (
            <button key={i} onClick={() => setPlayerIdx(i)}
              className={`py-3 rounded-xl font-display text-sm font-black transition-all btn-press border ${
                playerIdx === i
                  ? 'text-quest-bg border-quest-gold'
                  : 'text-gray-400 border-quest-border hover:border-gray-600'
              }`}
              style={playerIdx === i ? { background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' } : {}}>
              {i + 1}
            </button>
          ))}
        </div>
        <p className="font-body text-xs text-gray-600 text-center">
          You are <span className="text-white font-bold">Player {playerIdx + 1}</span>
        </p>
      </div>

      {error && <p className="font-body text-xs text-red-400 text-center">{error}</p>}

      <button onClick={handleStart}
        className="w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest btn-press text-white transition-all"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
        <UserCheck size={16} className="inline mr-2" /> Join as Player {playerIdx + 1}
      </button>
    </div>
  )
}

// ─── 8. VS Scoreboard ─────────────────────────────────────────────────────────
function VSScoreboard({ team1, team2, team1Done, team2Done }) {
  const leader = team1Done > team2Done ? team1 : team2Done > team1Done ? team2 : null
  return (
    <div className="bg-quest-panel border border-red-900/40 rounded-xl overflow-hidden">
      <div className="flex">
        {[{ name: team1, done: team1Done }, { name: team2, done: team2Done }].map((t, i) => (
          <div key={i} className={`flex-1 flex flex-col items-center py-3 gap-0.5 ${i === 0 ? 'border-r border-quest-border' : ''}`}>
            {leader === t.name && <Crown size={12} className="text-quest-gold" />}
            <p className="font-display text-[10px] uppercase tracking-widest text-gray-400 px-2 text-center line-clamp-1">{t.name}</p>
            <p className="font-display text-2xl font-black text-white">{t.done}</p>
            <p className="font-display text-[9px] text-gray-600 uppercase tracking-wider">tasks done</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main SquadMode ────────────────────────────────────────────────────────────
export default function SquadMode({ onComplete, totalXP, onGameStart }) {
  // view stack:
  //   'menu' | 'createSize' | 'createOuting' | 'createDiff' | 'active'
  //   'roomOuting' | 'roomDiff' | 'roomPlayerCount' | 'roomShare' | 'roomActive'
  //   'vsSize' | 'vsTeamName' | 'vsOuting' | 'vsDiff' | 'vsCode' | 'vsActive'
  //   'joinEntry' | 'joinTeamName' | 'joinSize' | 'joinActive'
  const [view, setView]         = useState('menu')
  const [players, setPlayers]   = useState([])
  const [outing, setOuting]     = useState(null)
  const [difficulty, setDiff]   = useState(null)
  const [tasks, setTasks]       = useState([])

  // Squad Room state
  const [roomResult,      setRoomResult]      = useState(null)  // { code, url, room }
  const [roomPlayerIdx,   setRoomPlayerIdx]   = useState(0)    // which player this device is
  const [currentRoomCode, setCurrentRoomCode] = useState(null) // active room code for sync
  const [currentRoomUrl,  setCurrentRoomUrl]  = useState(null) // shareable invite URL
  const [currentRoom,     setCurrentRoom]     = useState(null) // raw room obj (for re-encoding)
  const [pendingRoom,    setPendingRoom]    = useState(() => getRoomFromUrl())  // ?r= on load

  // Persisted active squad session (create-squad path only, not VS)
  const [squadSession, setSquadSession, clearSquadSession] = useActiveSession('nq_session_squad')

  // On mount: if there's a saved squad session, jump straight back into it
  const [_restored] = useState(() => {
    if (squadSession?.view === 'active') {
      // Restore will happen naturally via the render logic below
    }
    return true
  })

  // VS-specific
  const [vsCode, setVsCode]     = useState('')
  const [vsTeam1, setVsTeam1]   = useState('')
  const [vsTeam2, setVsTeam2]   = useState('')
  const [vsTeam2Tasks, setVsT2] = useState([])
  const [vsT1Done, setVsT1Done] = useState(0)
  const [vsT2Done, setVsT2Done] = useState(0)
  const [joinedGame, setJoinedGame] = useState(null)

  const reset = () => {
    setView('menu'); setPlayers([]); setOuting(null); setDiff(null); setTasks([])
    setVsCode(''); setVsTeam1(''); setVsTeam2(''); setVsT2([]); setJoinedGame(null)
    setVsT1Done(0); setVsT2Done(0)
    setRoomResult(null); setRoomPlayerIdx(0)
    setCurrentRoomCode(null); setCurrentRoomUrl(null); setCurrentRoom(null)
    clearSquadSession()
  }

  // ── Squad Room: player count state for room creation ────────────────────────
  const [roomPlayerCount, setRoomPlayerCount] = useState(4)

  // Build tasks for squad once outing + diff + players known.
  // Every entry produces a FRESH set of missions — tasks the player has
  // already seen for this (outing, difficulty, playerCount) combo are skipped
  // until the pool is exhausted, then the cycle resets.
  const buildTasks = useCallback((outingId, diffId, playerList) => {
    const n   = playerList.length
    const all = [...playerList]

    // Load history for this combo
    const seenKey = `${outingId}_${diffId}_${n}`
    let allSeen = {}
    try { allSeen = JSON.parse(localStorage.getItem('nq_seen_tasks') ?? '{}') } catch {}
    const excludeIds = new Set(allSeen[seenKey] ?? [])

    // Pick raw tasks via the appropriate path, threading excludeIds through
    let raw = []
    let assigned = false
    if (outingId !== 'bar' && n >= 2 && n <= 10) {
      raw = pickSquadVenueQuests(outingId, diffId, n, excludeIds)
    } else if (n >= 2 && n <= 10) {
      const barPickers = [
        null, null,          // 0, 1 — unused
        pickDuoQuestSet,     // 2
        pickTrioQuestSet,    // 3
        pickQuadQuestSet,    // 4
        pickPentaQuestSet,   // 5
        pickHexaQuestSet,    // 6
        pickHeptaQuestSet,   // 7
        pickOctaQuestSet,    // 8
        pickNonaQuestSet,    // 9
        pickDecaQuestSet,    // 10
      ]
      raw = barPickers[n](outingId, diffId, excludeIds)
    }
    if (!raw || raw.length === 0) {
      // Fallback: generic SOLO pool with player assignment
      const count = squadTaskCount(diffId, n)
      raw = pickNQuests(outingId, diffId, count, excludeIds)
      raw = assignPlayersToTasks(playerList, raw)
      assigned = true
    }

    // Record these IDs as seen. If the picker had to fall back to the full
    // pool (i.e. any returned task was already in excludeIds), it means the
    // cycle just reset — wipe the seen list and start a new cycle from these.
    const newIds = raw.map(t => t.id)
    const cycleReset = newIds.some(id => excludeIds.has(id))
    allSeen[seenKey] = cycleReset ? newIds : [...(allSeen[seenKey] ?? []), ...newIds]
    try { localStorage.setItem('nq_seen_tasks', JSON.stringify(allSeen)) } catch {}

    return assigned ? raw : raw.map(t => ({ ...t, assignedPlayers: all }))
  }, [])

  const handleTaskComplete = useCallback((task) => {
    // Update persisted session — works whether session already exists (host/same-device)
    // or is being lazily initialised right now (guest joined without prior setSquadSession call)
    setSquadSession(prev => ({
      view: 'active',
      ...(prev ?? {}),
      completedIds: [...new Set([...(prev?.completedIds ?? []), task.id])],
      xpEarned: (prev?.xpEarned ?? 0) + task.xp,
    }))
    onComplete(task)
  }, [onComplete, setSquadSession])

  // Re-roll: keep the same outing/difficulty/players, build a fresh task set,
  // reset completedIds + xpEarned in the persisted session. Stays in 'active' view.
  const handleRerollMissions = useCallback(() => {
    const s = squadSession
    const o = outing     ?? s?.outing
    const d = difficulty ?? s?.difficulty
    const p = players.length ? players : (s?.players ?? [])
    if (!o || !d || p.length === 0) return  // missing context — bail rather than corrupt session

    const freshTasks = buildTasks(o.id, d.id, p)
    setTasks(freshTasks)
    setSquadSession(prev => ({
      ...(prev ?? {}),
      view: 'active',
      players: p, outing: o, difficulty: d,
      tasks: freshTasks,
      completedIds: [],
      xpEarned: 0,
    }))
  }, [outing, difficulty, players, squadSession, buildTasks, setSquadSession])

  // ── RESUME persisted squad session on mount ────────────────────────────────
  if (view === 'menu' && squadSession?.view === 'active') {
    // A saved session exists — restore transient state and render active view.
    // In-memory state vars (currentRoomCode etc.) are null after a refresh,
    // so fall back to the values saved directly in squadSession.
    const s                 = squadSession
    const effectivePlayers  = players.length ? players : (s.players  ?? [])
    const effectiveOuting   = outing         ?? s.outing
    const effectiveDiff     = difficulty     ?? s.difficulty
    const effectiveTasks    = tasks.length   ? tasks   : (s.tasks    ?? [])
    const completedIds      = new Set(s.completedIds ?? [])
    const xpEarned          = s.xpEarned ?? 0
    // Room fields — prefer live in-memory state (user hasn't refreshed) but
    // fall back to what was saved in the session (user refreshed the page)
    const resumeRoomCode      = currentRoomCode        ?? s.roomCode        ?? null
    const resumeRoomUrl       = currentRoomUrl         ?? s.roomUrl         ?? null
    const resumeRoomPlayerIdx = roomPlayerIdx !== 0    ? roomPlayerIdx      : (s.roomPlayerIdx ?? 0)
    const resumeRoomCount     = currentRoom?.n         ?? s.roomPlayerCount ?? null
    const resumeHostKey       = currentRoom?.h         ?? s.hostKey         ?? null

    return <div className="pb-4"><ActiveTaskList
      tasks={effectiveTasks} difficulty={effectiveDiff} outing={effectiveOuting}
      onTaskComplete={handleTaskComplete} onNewGame={reset} onRerollMissions={handleRerollMissions}
      players={effectivePlayers}
      completedIds={completedIds}
      xpEarned={xpEarned}
      totalXP={totalXP}
      highlightPlayerIdx={resumeRoomPlayerIdx}
      roomCode={resumeRoomCode}
      roomUrl={resumeRoomUrl}
      roomPlayerCount={resumeRoomCount}
      hostKey={resumeHostKey}
    /></div>
  }

  // ── CREATE SQUAD FLOW ──────────────────────────────────────────────────────
  if (view === 'createSize') {
    return <div className="pb-4"><SquadBuilder
      title="Build Your Squad"
      minSize={2} maxSize={10}
      onBack={() => setView('menu')}
      onConfirm={(names) => { setPlayers(names); setView('createOuting') }}
    /></div>
  }
  if (view === 'createOuting') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('createSize')} />
        <p className="font-display text-sm font-bold text-white">Where are you headed?</p>
      </div>
      <OutingGrid onPick={(o) => { setOuting(o); setView('createDiff') }} />
    </div>
  }
  if (view === 'createDiff') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('createOuting')} />
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{outing.emoji} {outing.label}</p>
          <p className="font-display text-sm font-bold text-white">Pick difficulty</p>
        </div>
      </div>
      <DiffGrid onPick={(d) => {
        const t = buildTasks(outing.id, d.id, players)
        setDiff(d); setTasks(t); setView('active')
        // Save session so it survives tab close
        setSquadSession({ view: 'active', players, outing, difficulty: d, tasks: t, completedIds: [], xpEarned: 0 })
        // Notify parent of active game
        if (onGameStart) onGameStart({ outing, difficulty: d, sessionXP: 0, completed: 0, total: t.length })
      }} />
    </div>
  }
  if (view === 'active') {
    const completedIds = new Set(squadSession?.completedIds ?? [])
    const xpEarned     = squadSession?.xpEarned ?? 0
    return <div className="pb-4"><ActiveTaskList
      tasks={tasks} difficulty={difficulty} outing={outing}
      onTaskComplete={handleTaskComplete} onNewGame={reset} onRerollMissions={handleRerollMissions}
      players={players}
      completedIds={completedIds}
      xpEarned={xpEarned}
      totalXP={totalXP}
    /></div>
  }

  // ── VS FLOW (LEADER) ───────────────────────────────────────────────────────
  if (view === 'vsSize') {
    return <div className="pb-4"><SquadBuilder
      title="Your Team Players"
      minSize={2} maxSize={5}
      mustBeEven={false}
      onBack={() => setView('menu')}
      onConfirm={(names) => { setPlayers(names); setView('vsTeamName') }}
    /></div>
  }
  if (view === 'vsTeamName') {
    return <div className="pb-4"><TeamNameEntry
      onBack={() => setView('vsSize')}
      onConfirm={(name) => { setVsTeam1(name); setView('vsOuting') }}
    /></div>
  }
  if (view === 'vsOuting') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('vsTeamName')} />
        <p className="font-display text-sm font-bold text-white">Where are you headed?</p>
      </div>
      <OutingGrid onPick={(o) => { setOuting(o); setView('vsDiff') }} />
    </div>
  }
  if (view === 'vsDiff') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('vsOuting')} />
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{outing.emoji} {outing.label}</p>
          <p className="font-display text-sm font-bold text-white">Pick difficulty</p>
        </div>
      </div>
      <DiffGrid onPick={(d) => {
        const t = buildTasks(outing.id, d.id, players)
        const code = genCode()
        // Save base game to localStorage so team 2 can join
        saveVS({ code, outingId: outing.id, difficultyId: d.id, rawTasks: t.map(q => ({ id: q.id, title: q.title, desc: q.desc, tip: q.tip, xp: q.xp })), team1: vsTeam1, createdAt: Date.now() })
        setDiff(d); setTasks(t); setVsCode(code); setView('vsCode')
      }} />
    </div>
  }
  if (view === 'vsCode') {
    return <div className="pb-4"><VSCodeShare code={vsCode} teamName={vsTeam1} onContinue={() => setView('vsActive')} /></div>
  }
  if (view === 'vsActive') {
    return <div className="pb-4 space-y-4">
      <VSScoreboard team1={vsTeam1} team2={vsTeam2 || '???'} team1Done={vsT1Done} team2Done={vsT2Done} />
      <ActiveTaskList
        tasks={tasks} difficulty={difficulty} outing={outing}
        teamName={vsTeam1}
        onTaskComplete={(task) => { setVsT1Done(n => n + 1); handleTaskComplete(task) }}
        onNewGame={reset}
        totalXP={totalXP}
      />
    </div>
  }

  // ── JOIN FLOW (TEAM 2) ─────────────────────────────────────────────────────
  if (view === 'joinEntry') {
    return <div className="pb-4"><JoinVSGame
      onBack={() => setView('menu')}
      onJoined={(game, code) => { setJoinedGame(game); setVsCode(code); setView('joinTeamName') }}
    /></div>
  }
  if (view === 'joinTeamName') {
    return <div className="pb-4"><TeamNameEntry
      onBack={() => setView('joinEntry')}
      label="Your Team Name"
      onConfirm={(name) => { setVsTeam2(name); setView('joinSize') }}
    /></div>
  }
  if (view === 'joinSize') {
    return <div className="pb-4"><SquadBuilder
      title="Your Team Players"
      minSize={2} maxSize={10}
      onBack={() => setView('joinTeamName')}
      onConfirm={(names) => {
        // Assign the same raw tasks to this team's players
        const raw = joinedGame.rawTasks || []
        const assigned = assignPlayersToTasks(names, raw)
        const diff = DIFFICULTIES.find(d => d.id === joinedGame.difficultyId) || DIFFICULTIES[0]
        const out  = OUTING_TYPES.find(o => o.id === joinedGame.outingId) || OUTING_TYPES[0]
        setPlayers(names); setTasks(assigned); setDiff(diff); setOuting(out)
        setVsTeam1(joinedGame.team1)
        setView('joinActive')
      }}
    /></div>
  }
  if (view === 'joinActive') {
    return <div className="pb-4 space-y-4">
      <div className="bg-quest-panel border border-red-900/40 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-display text-[9px] uppercase tracking-widest text-gray-600">Opposing Team</p>
          <p className="font-display text-xs font-bold text-red-400">{vsTeam1}</p>
        </div>
        <div className="flex items-center gap-2">
          <Swords size={14} className="text-red-500" />
          <p className="font-display text-xs font-bold text-white">VS</p>
        </div>
        <div className="text-right">
          <p className="font-display text-[9px] uppercase tracking-widest text-gray-600">Your Team</p>
          <p className="font-display text-xs font-bold text-purple-400">{vsTeam2}</p>
        </div>
      </div>
      <ActiveTaskList
        tasks={tasks} difficulty={difficulty} outing={outing}
        teamName={vsTeam2}
        onTaskComplete={(task) => { setVsT2Done(n => n + 1); handleTaskComplete(task) }}
        onNewGame={reset}
        totalXP={totalXP}
      />
    </div>
  }

  // ── SQUAD ROOM CREATION FLOW ───────────────────────────────────────────────
  if (view === 'roomOuting') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('menu')} />
        <p className="font-display text-sm font-bold text-white">Where are you headed?</p>
      </div>
      <OutingGrid onPick={(o) => { setOuting(o); setView('roomDiff') }} />
    </div>
  }
  if (view === 'roomDiff') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('roomOuting')} />
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{outing.emoji} {outing.label}</p>
          <p className="font-display text-sm font-bold text-white">Pick difficulty</p>
        </div>
      </div>
      <DiffGrid onPick={(d) => { setDiff(d); setView('roomPlayerCount') }} />
    </div>
  }
  if (view === 'roomPlayerCount') {
    return <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BackBtn onClick={() => setView('roomDiff')} />
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{outing.emoji} {outing.label} · {difficulty.label}</p>
          <p className="font-display text-sm font-bold text-white">How many players?</p>
        </div>
      </div>
      <div className="bg-quest-panel border border-quest-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => setRoomPlayerCount(n => Math.max(2, n - 1))}
            className="w-11 h-11 rounded-xl border border-quest-border text-gray-400 hover:text-white flex items-center justify-center text-xl btn-press transition-colors">−</button>
          <div className="text-center">
            <p className="font-display text-5xl font-black text-quest-gold">{roomPlayerCount}</p>
            <p className="font-display text-[9px] uppercase tracking-wider text-gray-600">players</p>
          </div>
          <button onClick={() => setRoomPlayerCount(n => Math.min(10, n + 1))}
            className="w-11 h-11 rounded-xl border border-quest-border text-gray-400 hover:text-white flex items-center justify-center text-xl btn-press transition-colors">+</button>
        </div>
        <p className="font-body text-xs text-gray-500 text-center">Each player joins on their own phone and sees the same task list.</p>
      </div>
      <button
        onClick={() => {
          // Generate tasks for a generic player list (Player 1…N)
          const playerList = Array.from({ length: roomPlayerCount }, (_, i) => `Player ${i + 1}`)
          const t = buildTasks(outing.id, difficulty.id, playerList)
          // Stamp the creator's session key into the room so every guest
          // who decodes the URL knows who the host is.
          const result = createRoom(t, outing.id, difficulty.id, roomPlayerCount, getSessionKey())
          if (!result) return
          setTasks(t); setPlayers(playerList)
          setRoomResult(result)
          setView('roomShare')
        }}
        className="w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest text-quest-bg btn-press transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' }}>
        Generate Room Code →
      </button>
    </div>
  }
  if (view === 'roomShare') {
    return <div className="pb-4">
      <RoomShareScreen
        code={roomResult.code}
        url={roomResult.url}
        outing={outing}
        difficulty={difficulty}
        playerCount={roomPlayerCount}
        onBack={() => setView('roomPlayerCount')}
        onStart={() => {
          const code = roomResult?.code ?? null
          const url  = roomResult?.url  ?? null
          const room = roomResult?.room ?? null
          setRoomPlayerIdx(0)
          setCurrentRoomCode(code)
          setCurrentRoomUrl(url)
          setCurrentRoom(room)
          setSquadSession({
            view: 'active',
            players, outing, difficulty, tasks,
            completedIds: [], xpEarned: 0,
            // Room metadata — persisted so a refresh fully restores the session
            roomCode:        code,
            roomUrl:         url,
            roomPlayerIdx:   0,
            roomPlayerCount: roomPlayerCount,
            hostKey:         room?.h ?? null,
            room,
          })
          setView('roomActive')
        }}
      />
    </div>
  }
  if (view === 'roomActive') {
    const s            = squadSession
    const completedIds = new Set(s?.completedIds ?? [])
    const xpEarned     = s?.xpEarned ?? 0
    return <div className="pb-4"><ActiveTaskList
      tasks={tasks.length ? tasks : (s?.tasks ?? [])}
      difficulty={difficulty ?? s?.difficulty}
      outing={outing ?? s?.outing}
      onTaskComplete={handleTaskComplete} onNewGame={reset} onRerollMissions={handleRerollMissions}
      players={players.length ? players : (s?.players ?? [])}
      completedIds={completedIds}
      xpEarned={xpEarned}
      totalXP={totalXP}
      highlightPlayerIdx={roomPlayerIdx !== 0 ? roomPlayerIdx : (s?.roomPlayerIdx ?? 0)}
      roomCode={currentRoomCode ?? s?.roomCode}
      roomUrl={currentRoomUrl  ?? s?.roomUrl}
      roomPlayerCount={currentRoom?.n ?? s?.roomPlayerCount ?? roomPlayerCount}
      hostKey={currentRoom?.h ?? s?.hostKey ?? null}
    /></div>
  }

  // ── UNIFIED JOIN (Squad Room or VS) ─────────────────────────────────────────
  if (view === 'joinEntry') {
    return <div className="pb-4">
      <RoomJoinScreen
        preloadedRoom={pendingRoom}
        onBack={() => { clearRoomParam(); setPendingRoom(null); setView('menu') }}
        onJoined={({ room, playerIdx, playerName, outing: o, difficulty: d }) => {
          // Joined a Squad Room
          const t = room.t.map(task => ({ ...task, desc: task.desc || '' }))
          const playerList = Array.from({ length: room.n }, (_, i) =>
            i === playerIdx ? playerName : `Player ${i + 1}`
          )
          const url = getShareUrl(room)
          setTasks(t); setPlayers(playerList)
          setOuting(o); setDiff(d)
          setRoomPlayerIdx(playerIdx)
          setCurrentRoomCode(room.code)
          setCurrentRoom(room)
          setCurrentRoomUrl(url)
          // Initialise session so completions survive a refresh and the null-guard
          // in handleTaskComplete always has a valid object to spread into
          setSquadSession({
            view: 'active',
            players: playerList, outing: o, difficulty: d, tasks: t,
            completedIds: [], xpEarned: 0,
            // Room metadata
            roomCode:        room.code,
            roomUrl:         url,
            roomPlayerIdx:   playerIdx,
            roomPlayerCount: room.n,
            hostKey:         room?.h ?? null,
            room,
          })
          setPendingRoom(null)
          clearRoomParam()
          setView('roomActive')
        }}
      />
    </div>
  }

  // ── MENU ───────────────────────────────────────────────────────────────────
  return <div className="pb-4"><SquadMenu
    onCreateRoom={() => setView('roomOuting')}
    onCreateSquad={() => setView('createSize')}
    onVSMode={() => setView('vsSize')}
    onJoin={() => setView('joinEntry')}
    pendingRoom={pendingRoom}
  /></div>
}
