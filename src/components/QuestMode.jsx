import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, CheckCircle, Circle, Zap, Trophy, RefreshCw, ChevronDown, ChevronUp, Timer, Search, X, Clock } from 'lucide-react'
import { OUTING_TYPES, DIFFICULTIES, pickQuestSet } from '../data/outingQuests'
import { useActiveSession } from '../hooks/useActiveSession'
import { useNightTimer } from '../hooks/useNightTimer'
import { inferCategory, estimateMins, ALL_CATEGORIES } from '../data/questMeta'
import NightComplete from './NightComplete'
import NightTimerBar from './NightTimerBar'
import TimerSetupModal from './TimerSetupModal'
import Stopwatch from './Stopwatch'

// ─── Outing Picker ─────────────────────────────────────────────────────────────
function OutingPicker({ onPick }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
      <div className="text-center pt-2 pb-3 shrink-0">
        <h2 className="font-display text-xl font-black text-white">Where are you headed?</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Pick your outing to get tailored missions</p>
      </div>
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {OUTING_TYPES.map(o => (
          <button key={o.id} onClick={() => onPick(o)}
            className="flex-1 min-h-[120px] w-full flex items-center gap-5 px-6 py-5 bg-quest-panel border border-quest-border rounded-2xl hover:border-quest-gold-dim hover:bg-quest-panel/80 transition-all btn-press text-left">
            <div className="w-20 h-20 rounded-2xl bg-quest-bg border border-quest-border flex items-center justify-center text-4xl shrink-0">
              {o.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg font-bold text-white leading-tight">{o.label}</p>
              <p className="font-body text-base text-gray-500 mt-1.5 leading-snug">{o.desc}</p>
            </div>
            <ChevronLeft size={18} className="text-gray-700 rotate-180 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Difficulty Picker ─────────────────────────────────────────────────────────
function DifficultyPicker({ outing, onPick, onBack }) {
  const DIFF_EMOJI = { easy: '🌙', medium: '⚔️', hard: '👑' }
  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl border border-quest-border text-gray-500 hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Outing</p>
          <p className="font-display text-sm font-bold text-white">{outing.emoji} {outing.label}</p>
        </div>
      </div>

      <div className="text-center py-4 shrink-0">
        <h2 className="font-display text-xl font-black text-white">Pick your difficulty</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Harder = more tasks, higher XP per task</p>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => onPick(d)}
            className="flex-1 min-h-[140px] w-full p-5 rounded-2xl border text-left transition-all btn-press hover:scale-[1.01] flex flex-col justify-between"
            style={{ background: d.bg, borderColor: d.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{DIFF_EMOJI[d.id] ?? '🎯'}</span>
                <span className="font-display text-xl font-black uppercase tracking-wider" style={{ color: d.color }}>
                  {d.label}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-display text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: d.color, background: `${d.border}` }}>
                  {d.taskCount} tasks
                </span>
                <span className="font-display text-xs font-bold" style={{ color: d.color }}>
                  {d.xpRange[0]}–{d.xpRange[1]} XP ea.
                </span>
              </div>
            </div>
            <p className="font-body text-base text-gray-300 leading-snug mt-3">{d.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Per-task countdown (for tasks with timeLimitMinutes) ─────────────────────
function TaskCountdown({ totalMinutes, onExpire }) {
  const totalSecs = totalMinutes * 60
  const [remaining, setRemaining] = useState(totalSecs)
  const [running,   setRunning]   = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); onExpire?.(); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, onExpire])

  const pct     = remaining / totalSecs
  const mins    = Math.floor(remaining / 60)
  const secs    = remaining % 60
  const expired = remaining === 0
  const color   = expired ? '#ef4444' : pct > 0.6 ? '#22c55e' : pct > 0.3 ? '#f59e0b' : '#ef4444'
  const radius  = 14
  const circ    = 2 * Math.PI * radius

  if (!running && remaining === totalSecs) {
    return (
      <button onClick={() => setRunning(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-quest-border font-display text-[10px] uppercase tracking-wider text-gray-500 hover:text-quest-gold hover:border-quest-gold-dim transition-all">
        <Timer size={10} /> {totalMinutes}m timer
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${expired ? 'animate-pulse' : ''}`}>
      <svg width="36" height="36" className="-rotate-90 shrink-0">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#1e1e35" strokeWidth="3" />
        <circle cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
      </svg>
      <div>
        {expired
          ? <p className="font-display text-xs font-black text-red-400 uppercase">Time's up!</p>
          : <p className="font-display text-sm font-black tabular-nums" style={{ color }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
        }
        <p className="font-display text-[8px] uppercase tracking-wider text-gray-600">remaining</p>
      </div>
    </div>
  )
}

// ─── Single Task Row ───────────────────────────────────────────────────────────
function TaskRow({ task, index, completed, onComplete, diffColor, inPhase }) {
  const [expanded, setExpanded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const category = useMemo(() => inferCategory(task), [task])
  const mins     = useMemo(() => estimateMins(task), [task])

  return (
    <div className={`rounded-xl border transition-all ${
      completed
        ? 'opacity-50 bg-quest-bg border-quest-border/30'
        : inPhase
          ? 'bg-quest-panel'    // border applied via style below
          : 'bg-quest-panel border-quest-border'
    }`}
      style={inPhase && !completed ? { borderColor: `${diffColor}55`, boxShadow: `0 0 0 1px ${diffColor}22` } : undefined}>

      {/* Main row */}
      <div className="flex items-start gap-3 p-3">
        {/* Complete button */}
        <button
          onClick={() => !completed && onComplete(task)}
          disabled={completed}
          className="mt-0.5 shrink-0 transition-transform active:scale-90"
        >
          {completed
            ? <CheckCircle size={22} className="text-green-500" />
            : <Circle size={22} className="text-gray-600 hover:text-gray-300 transition-colors" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-display text-sm font-bold leading-snug ${completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              {inPhase && !completed && (
                <span className="font-display text-[8px] uppercase tracking-wider px-1 py-0.5 rounded"
                  style={{ color: diffColor, background: `${diffColor}20` }}>Now</span>
              )}
              <Zap size={10} style={{ color: diffColor }} />
              <span className="font-display text-xs font-black" style={{ color: diffColor }}>{task.xp}</span>
            </div>
          </div>

          {/* Meta row — category + time estimate */}
          {!completed && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="font-display text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ color: category.color, background: `${category.color}15`, border: `1px solid ${category.color}33` }}>
                <span className="text-[10px] leading-none">{category.emoji}</span>
                {category.label}
              </span>
              <span className="font-display text-[9px] uppercase tracking-wider text-gray-600 flex items-center gap-0.5">
                <Clock size={9} /> ~{mins} min
              </span>
            </div>
          )}

          {/* Expand toggle */}
          {!completed && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 mt-1.5 text-[10px] font-display uppercase tracking-wider text-gray-600 hover:text-gray-400 transition-colors"
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {expanded ? 'Hide' : 'Mission details'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && !completed && (
        <div className="px-3 pb-3 space-y-2.5 animate-fade-in">
          <p className="font-body text-sm text-gray-300 leading-relaxed pl-8">{task.desc}</p>
          {task.tip && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-quest-bg border border-quest-border/50 ml-8">
              <span className="text-xs">💡</span>
              <p className="font-body text-xs text-gray-500 leading-relaxed italic">{task.tip}</p>
            </div>
          )}
          {/* Per-task countdown (only for tasks that have a time limit) */}
          {task.timeLimitMinutes && (
            <div className="ml-8">
              <TaskCountdown
                totalMinutes={task.timeLimitMinutes}
                onExpire={() => setTimedOut(true)}
              />
              {timedOut && (
                <p className="font-display text-[10px] uppercase tracking-wider text-red-400 mt-1">
                  Time's up — still counts if you do it now!
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Active Task List ──────────────────────────────────────────────────────────
function ActiveTaskList({ tasks, difficulty, outing, onTaskComplete, onNewGame, onRerollMissions, totalXPEarned, completedIds, totalXP, timerEnabled, timerStartTime }) {
  const completed = completedIds   // Set provided by parent (persisted)
  const diffCfg   = DIFFICULTIES.find(d => d.id === difficulty.id)
  const popIdRef  = useRef(0)
  const [xpPops, setXpPops] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  // Defensive force flag — flips true the instant the LAST task is ticked.
  // Guards against any state-propagation lag from parent: once we know the
  // user has completed everything, NightComplete renders regardless of whether
  // the parent's session state has updated yet.
  const [forceComplete, setForceComplete] = useState(false)

  // Reset force flag if a new set of tasks arrives (e.g. after re-roll).
  useEffect(() => { setForceComplete(false) }, [tasks])
  const { started, formatted, phase, phaseIndex, elapsedMinutes, startNight, endNight, PHASES } = useNightTimer()

  // Auto-start night timer when this task list first mounts
  useEffect(() => { startNight() }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // Build per-task meta (category + estimated mins) once
  const taskMeta = useMemo(() => {
    const m = new Map()
    for (const t of tasks) m.set(t.id, { category: inferCategory(t), mins: estimateMins(t) })
    return m
  }, [tasks])

  // Which categories actually appear in this task set? (for filter chips)
  const availableCategories = useMemo(() => {
    const set = new Set()
    for (const t of tasks) set.add(taskMeta.get(t.id).category.id)
    return ALL_CATEGORIES.filter(c => set.has(c.id))
  }, [tasks, taskMeta])

  // Apply search + category filter
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter(t => {
      const meta = taskMeta.get(t.id)
      if (categoryFilter !== 'all' && meta.category.id !== categoryFilter) return false
      if (q) {
        const hay = `${t.title} ${t.desc ?? t.description ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [tasks, search, categoryFilter, taskMeta])

  // Determine which tasks are "in phase" based on quest category (outing quests have no category,
  // so fall back to position-based: first third = warmup, middle = rising/peak, last third = late)
  const taskCount = tasks.length
  const inPhaseSet = new Set(
    tasks
      .map((t, i) => {
        if (t.category) {
          // Party quests — match by category
          return phase.categories.includes(t.category) ? t.id : null
        }
        // Outing quests — match by position in the list
        const posRatio = i / Math.max(taskCount - 1, 1)
        const posMatch = phaseIndex === 0 ? posRatio < 0.35
          : phaseIndex === 1 ? posRatio >= 0.2 && posRatio < 0.65
          : phaseIndex === 2 ? posRatio >= 0.5 && posRatio < 0.85
          : posRatio >= 0.65   // late night
        return posMatch ? t.id : null
      })
      .filter(Boolean)
  )

  const handleComplete = useCallback((task) => {
    // Spawn a floating +XP pop
    const id = ++popIdRef.current
    setXpPops(prev => [...prev, { id, value: task.xp }])
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 1050)
    onTaskComplete(task)

    // If this click was the LAST remaining task, force the completion screen
    // to render this tick — don't wait for parent state to round-trip.
    const projectedDone = new Set([...completed, task.id]).size
    if (projectedDone >= tasks.length && tasks.length > 0) {
      setForceComplete(true)
    }
  }, [onTaskComplete, completed, tasks.length])

  const done    = completed.size
  const total   = tasks.length
  const pct     = Math.round((done / total) * 100)
  const allDone = forceComplete || (done === total && total > 0)

  // ── All done → show completion screen ─────────────────────────────────────
  if (allDone) {
    return (
      <NightComplete
        outing={outing}
        difficulty={difficulty}
        xpEarned={totalXPEarned}
        tasksCompleted={Math.max(done, tasks.length)}
        totalXP={totalXP}
        // "Same Again" → re-roll fresh missions with same outing+difficulty
        onPlayAgain={onRerollMissions ?? onNewGame}
        onNewOuting={onNewGame}
        onReturnHome={onNewGame}
      />
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stopwatch timer at the very top (if enabled) */}
      {timerEnabled === true && timerStartTime ? (
        <div className="bg-quest-gold/10 border-2 border-quest-gold rounded-2xl p-4 animate-fade-in">
          <Stopwatch startTime={timerStartTime} />
        </div>
      ) : null}

      {/* Header with XP pops */}
      <div className="relative flex items-center gap-3">
        <button onClick={onNewGame} className="w-8 h-8 flex items-center justify-center rounded-xl border border-quest-border text-gray-500 hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">{outing.emoji} {outing.label}</p>
          <p className="font-display text-sm font-bold uppercase tracking-wider" style={{ color: diffCfg.color }}>{difficulty.label} Mode</p>
        </div>
        {/* XP counter + floating pops */}
        <div className="relative text-right">
          <p className="font-display text-lg font-black text-quest-gold">{totalXPEarned}</p>
          <p className="font-display text-[9px] uppercase tracking-wider text-gray-600">XP earned</p>
          {xpPops.map(pop => (
            <span key={pop.id} className="xp-pop absolute right-0 top-0 font-display text-sm font-black whitespace-nowrap"
              style={{ color: diffCfg.color, textShadow: `0 0 12px ${diffCfg.color}` }}>
              +{pop.value}
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-quest-panel border border-quest-border rounded-xl px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs uppercase tracking-widest text-gray-500">Progress</span>
          <span className="font-display text-sm font-black text-white">{done} <span className="text-gray-600">/ {total}</span></span>
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

      {/* Search + category filter — shown only when timer is enabled and there are >3 tasks */}
      {timerEnabled && tasks.length > 3 && (
        <div className="space-y-2">
          {/* Search input */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search this mission set…"
              className="w-full bg-quest-panel border border-quest-border rounded-xl pl-9 pr-9 py-2 font-body text-xs text-gray-200 placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                <X size={11} />
              </button>
            )}
          </div>

          {/* Category chips (only show if there's more than one category in the set) */}
          {availableCategories.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button onClick={() => setCategoryFilter('all')}
                className={`shrink-0 px-2.5 py-1 rounded-full border font-display text-[9px] uppercase tracking-wider font-bold transition-all btn-press ${
                  categoryFilter === 'all'
                    ? 'bg-quest-gold/15 text-quest-gold border-quest-gold/30'
                    : 'bg-quest-panel border-quest-border text-gray-500 hover:text-gray-300'
                }`}>
                All · {tasks.length}
              </button>
              {availableCategories.map(c => {
                const count = tasks.filter(t => taskMeta.get(t.id).category.id === c.id).length
                const active = categoryFilter === c.id
                return (
                  <button key={c.id} onClick={() => setCategoryFilter(c.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full border font-display text-[9px] uppercase tracking-wider font-bold transition-all btn-press flex items-center gap-1`}
                    style={active
                      ? { color: c.color, background: `${c.color}20`, borderColor: `${c.color}55` }
                      : { color: '#6b7280', background: 'rgb(var(--nq-panel))', borderColor: 'rgb(var(--nq-border))' }
                    }>
                    <span className="text-[10px]">{c.emoji}</span>
                    {c.label} · {count}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6">
            <Search size={20} className="text-gray-700 mx-auto mb-2" />
            <p className="font-display text-[10px] uppercase tracking-wider text-gray-600">No missions match your filters</p>
            <button onClick={() => { setSearch(''); setCategoryFilter('all') }}
              className="mt-2 font-display text-[10px] uppercase tracking-widest text-quest-gold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          filteredTasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              index={i}
              completed={completed.has(task.id)}
              onComplete={handleComplete}
              diffColor={diffCfg.color}
              inPhase={!completed.has(task.id) && inPhaseSet.has(task.id)}
            />
          ))
        )}
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

// ─── Main QuestMode ────────────────────────────────────────────────────────────
export default function QuestMode({ onComplete, totalXP }) {
  const [session, setSession, clearSession] = useActiveSession('nq_session_solo')

  // Derive state from persisted session (falls back to initial values)
  const step         = session?.step         ?? 'outing'
  const outing       = session?.outing       ?? null
  const difficulty   = session?.difficulty   ?? null
  const tasks        = session?.tasks        ?? []
  const sessionXP    = session?.sessionXP    ?? 0
  const completedIds = new Set(session?.completedIds ?? [])
  const timerEnabled = session?.timerEnabled ?? false
  const timerStartTime = session?.timerStartTime ?? null

  const handleOutingPick = (o) =>
    setSession(s => ({ ...s, step: 'difficulty', outing: o, completedIds: [], sessionXP: 0, timerEnabled: false, timerStartTime: null }))

  // Shared: build a fresh set of tasks for an outing+difficulty, skipping
  // anything already seen (until the pool cycles). Returns the picks and
  // updates the seen-list in localStorage.
  const pickFreshSet = (o, d) => {
    const seenKey = `${o.id}_${d.id}_solo`
    let allSeen = {}
    try { allSeen = JSON.parse(localStorage.getItem('nq_seen_tasks') ?? '{}') } catch {}
    const excludeIds = new Set(allSeen[seenKey] ?? [])

    const picked     = pickQuestSet(o.id, d.id, excludeIds)
    const newIds     = picked.map(t => t.id)
    const cycleReset = newIds.some(id => excludeIds.has(id))
    allSeen[seenKey] = cycleReset ? newIds : [...(allSeen[seenKey] ?? []), ...newIds]
    try { localStorage.setItem('nq_seen_tasks', JSON.stringify(allSeen)) } catch {}
    return picked
  }

  const handleDiffPick = (d) => {
    const picked = pickFreshSet(outing, d)
    setSession({ step: 'timer', outing, difficulty: d, tasks: picked, sessionXP: 0, completedIds: [], timerEnabled: false, timerStartTime: null })
  }

  const handleTimerEnable = () => {
    setSession(s => ({ ...s, step: 'active', timerEnabled: true, timerStartTime: Date.now() }))
  }

  const handleTimerDisable = () => {
    setSession(s => ({ ...s, step: 'active', timerEnabled: false, timerStartTime: null }))
  }

  const handleTaskComplete = useCallback((task) => {
    setSession(s => ({
      ...s,
      sessionXP:    (s?.sessionXP ?? 0) + task.xp,
      completedIds: [...new Set([...(s?.completedIds ?? []), task.id])],
    }))
    onComplete(task)
  }, [onComplete, setSession])

  const handleNewGame = () => clearSession()

  // Re-roll: same outing/difficulty, fresh missions, reset progress, stay active.
  const handleRerollMissions = useCallback(() => {
    if (!outing || !difficulty) return
    const fresh = pickFreshSet(outing, difficulty)
    setSession(s => ({
      ...(s ?? {}),
      step: 'active',
      outing, difficulty,
      tasks: fresh,
      sessionXP: 0,
      completedIds: [],
      timerEnabled: false,
      timerStartTime: null,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outing, difficulty, setSession])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {step === 'outing'     && <OutingPicker onPick={handleOutingPick} />}
      {step === 'difficulty' && <DifficultyPicker outing={outing} onPick={handleDiffPick} onBack={() => setSession(s => ({ ...s, step: 'outing' }))} />}
      {step === 'timer'      && <TimerSetupModal onEnable={handleTimerEnable} onDisable={handleTimerDisable} />}
      {step === 'active'     && (
        <ActiveTaskList
          tasks={tasks}
          difficulty={difficulty}
          outing={outing}
          onTaskComplete={handleTaskComplete}
          onNewGame={handleNewGame}
          onRerollMissions={handleRerollMissions}
          totalXPEarned={sessionXP}
          completedIds={completedIds}
          totalXP={totalXP}
          timerEnabled={timerEnabled}
          timerStartTime={timerStartTime}
        />
      )}
    </div>
  )
}
