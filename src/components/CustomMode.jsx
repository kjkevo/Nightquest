import { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, CheckCircle, LogIn, Lock, Unlock, Zap, RotateCcw, ChevronLeft, Edit3, Users } from 'lucide-react'
import NightComplete from './NightComplete'
import { useGameState } from '../hooks/useGameState'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function saveGame(game) {
  const all = loadAll()
  all[game.code] = game
  localStorage.setItem('nq_custom_games', JSON.stringify(all))
}

function loadAll() {
  try { return JSON.parse(localStorage.getItem('nq_custom_games') || '{}') } catch { return {} }
}

function loadGame(code) {
  return loadAll()[code.toUpperCase()] || null
}

// ─── Challenge Form Row ─────────────────────────────────────────────────────────
function ChallengeRow({ challenge, index, onChange, onRemove }) {
  return (
    <div className="bg-quest-bg border border-quest-border rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-display text-[10px] uppercase tracking-widest text-gray-600 w-5">{index + 1}.</span>
        <input
          value={challenge.title}
          onChange={e => onChange({ ...challenge, title: e.target.value })}
          placeholder="Challenge title…"
          maxLength={60}
          className="flex-1 bg-transparent border-none outline-none font-display text-sm text-white placeholder-gray-700"
        />
        <button onClick={onRemove} className="text-gray-700 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
      <textarea
        value={challenge.desc}
        onChange={e => onChange({ ...challenge, desc: e.target.value })}
        placeholder="What must players do? Be specific…"
        rows={2}
        maxLength={200}
        className="w-full bg-quest-panel border border-quest-border/50 rounded-lg px-3 py-2 font-body text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-quest-gold-dim resize-none transition-colors"
      />
      <div className="flex items-center gap-2">
        <Zap size={11} className="text-quest-gold-dim" />
        <span className="font-display text-[10px] uppercase tracking-widest text-gray-600">Points</span>
        <input
          type="number"
          min={1} max={9999}
          value={challenge.points}
          onChange={e => onChange({ ...challenge, points: Math.max(1, parseInt(e.target.value) || 1) })}
          className="w-20 bg-quest-panel border border-quest-border rounded-lg px-2 py-1 font-display text-sm text-quest-gold outline-none focus:border-quest-gold-dim text-center transition-colors"
        />
      </div>
    </div>
  )
}

// ─── Creator View ──────────────────────────────────────────────────────────────
function Creator({ onPublish }) {
  const [title, setTitle]           = useState('')
  const [challenges, setChallenges] = useState([
    { id: 1, title: '', desc: '', points: 100 },
    { id: 2, title: '', desc: '', points: 100 },
  ])
  const [nextId, setNextId] = useState(3)

  const addChallenge = () => {
    setChallenges(c => [...c, { id: nextId, title: '', desc: '', points: 100 }])
    setNextId(n => n + 1)
  }

  const updateChallenge = (id, updated) =>
    setChallenges(c => c.map(ch => ch.id === id ? updated : ch))

  const removeChallenge = (id) =>
    setChallenges(c => c.filter(ch => ch.id !== id))

  const handlePublish = () => {
    const filled = challenges.filter(c => c.title.trim())
    if (!filled.length || !title.trim()) return
    const code = genCode()
    const game = {
      code,
      title: title.trim(),
      challenges: filled.map(c => ({ ...c, title: c.title.trim(), desc: c.desc.trim() })),
      createdAt: Date.now(),
      scores: {},
    }
    saveGame(game)
    onPublish(game)
  }

  const valid = title.trim() && challenges.some(c => c.title.trim())

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center pt-2 pb-1">
        <h2 className="font-display text-lg font-black text-white">Create a Challenge Set</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Build missions, assign points, share the code</p>
      </div>

      {/* Game title */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-3">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-2">Game Name</p>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Vegas Night, Birthday Bash, Office Party…"
          maxLength={50}
          className="w-full bg-transparent border-none outline-none font-display text-sm text-white placeholder-gray-700"
        />
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 px-1">Challenges ({challenges.length})</p>
        {challenges.map((c, i) => (
          <ChallengeRow
            key={c.id}
            challenge={c}
            index={i}
            onChange={updated => updateChallenge(c.id, updated)}
            onRemove={() => removeChallenge(c.id)}
          />
        ))}
        <button
          onClick={addChallenge}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-quest-border text-gray-600 hover:border-quest-gold-dim hover:text-quest-gold font-display text-xs uppercase tracking-widest transition-all btn-press">
          <Plus size={13} /> Add Challenge
        </button>
      </div>

      {/* Publish */}
      <button
        onClick={handlePublish}
        disabled={!valid}
        className={`w-full py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${valid ? 'bg-gradient-to-r from-purple-700 to-purple-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'}`}
        style={valid ? { boxShadow: '0 0 20px rgba(124,58,237,0.4)' } : {}}>
        <Lock size={13} className="inline mr-2" />
        Generate Access Code
      </button>
    </div>
  )
}

// ─── Published Confirmation ────────────────────────────────────────────────────
function PublishedConfirm({ game, onReset, onPlay }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(game.code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }).catch(() => alert(game.code))
  }
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(124,58,237,0.35)' }}>
          <Lock size={28} className="text-purple-400" />
        </div>
        <p className="font-display text-sm font-black text-white uppercase tracking-widest">{game.title}</p>
        <p className="font-body text-xs text-gray-500">{game.challenges.length} challenges · Share the code below</p>
      </div>

      {/* Code */}
      <div className="bg-quest-panel border-2 border-quest-gold/30 rounded-2xl p-5 flex flex-col items-center gap-3"
        style={{ boxShadow: '0 0 30px rgba(240,192,96,0.1)' }}>
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Access Code</p>
        <p className="font-display text-4xl font-black tracking-[0.35em] text-quest-gold select-all">{game.code}</p>
        <button onClick={copy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-quest-bg border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          {copied ? <><CheckCircle size={12} className="text-green-400" /> Copied!</> : <><Copy size={12} /> Copy Code</>}
        </button>
      </div>

      <div className="bg-quest-panel border border-quest-border rounded-xl divide-y divide-quest-border/50">
        {game.challenges.map((c, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center justify-between">
            <div>
              <p className="font-display text-xs font-bold text-gray-300">{c.title}</p>
              {c.desc && <p className="font-body text-[10px] text-gray-600 mt-0.5 line-clamp-1">{c.desc}</p>}
            </div>
            <span className="font-display text-xs font-black text-quest-gold ml-3 shrink-0">{c.points} pts</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => onPlay(game)}
          className="flex-1 py-3 rounded-xl font-display text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-purple-700 to-purple-600 btn-press">
          <Unlock size={12} className="inline mr-1.5" /> Play Now
        </button>
        <button onClick={onReset}
          className="flex-1 py-3 rounded-xl font-display text-xs uppercase tracking-widest text-gray-400 border border-quest-border hover:text-gray-200 transition-colors btn-press">
          <RotateCcw size={12} className="inline mr-1.5" /> New Game
        </button>
      </div>
    </div>
  )
}

// ─── Join View ─────────────────────────────────────────────────────────────────
function JoinView({ onJoin }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    const game = loadGame(code)
    if (!game) { setError('No game found with that code. Check and try again.'); return }
    setError('')
    onJoin(game)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center pt-2 pb-1">
        <h2 className="font-display text-lg font-black text-white">Join a Game</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Enter the 6-character access code</p>
      </div>

      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase().slice(0, 6)); setError('') }}
          placeholder="e.g. AB12CD"
          maxLength={6}
          className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-3 font-display text-xl text-center tracking-[0.5em] text-quest-gold outline-none focus:border-quest-gold-dim uppercase transition-colors"
        />
        {error && <p className="font-body text-xs text-red-400 text-center">{error}</p>}
        <button
          onClick={handleJoin}
          disabled={code.length < 6}
          className={`w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${code.length === 6 ? 'bg-gradient-to-r from-purple-700 to-purple-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'}`}
          style={code.length === 6 ? { boxShadow: '0 0 16px rgba(124,58,237,0.4)' } : {}}>
          <LogIn size={14} className="inline mr-2" /> Join Game
        </button>
      </div>
    </div>
  )
}

// ─── Active Game Player ────────────────────────────────────────────────────────
function GamePlayer({ game, onBack, onComplete }) {
  const [scores, setScores] = useState(() => {
    const saved = loadGame(game.code)?.scores || {}
    return saved
  })
  const [playerName, setPlayerName] = useState('')
  const [nameSet, setNameSet] = useState(false)
  const [activeIdx, setActiveIdx] = useState(null)
  const [completedIds, setCompletedIds] = useState(new Set())
  const { totalXP } = useGameState()
  const [copiedCode, setCopiedCode] = useState(false)

  const totalPts = Object.values(scores).reduce((s, v) => s + v, 0)
  const myPts = scores[playerName] || 0

  const copyCode = () => {
    navigator.clipboard?.writeText(game.code).then(() => { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) })
  }

  const handleClaim = (c) => {
    if (!nameSet) return
    const updated = { ...scores, [playerName]: (scores[playerName] || 0) + c.points }
    setScores(updated)
    setCompletedIds(s => new Set([...s, c.id]))
    setActiveIdx(null)
    // Persist score to localStorage
    const game2 = loadGame(game.code)
    if (game2) { game2.scores = updated; saveGame(game2) }
    onComplete(c)
  }

  if (!nameSet) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl border border-quest-border text-gray-500 hover:text-gray-200 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <p className="font-display text-sm font-bold text-white">{game.title}</p>
        </div>
        <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
          <p className="font-display text-xs uppercase tracking-widest text-gray-500">Your name / nickname</p>
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name…"
            maxLength={20}
            className="w-full bg-quest-bg border border-quest-border rounded-xl px-4 py-2.5 font-display text-sm text-white outline-none focus:border-quest-gold-dim transition-colors"
          />
          <button
            onClick={() => { if (playerName.trim()) setNameSet(true) }}
            disabled={!playerName.trim()}
            className={`w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest text-white transition-all btn-press ${playerName.trim() ? 'bg-gradient-to-r from-purple-700 to-purple-600' : 'bg-quest-panel text-gray-600 cursor-not-allowed'}`}>
            Enter Game
          </button>
        </div>
      </div>
    )
  }

  // ── All challenges claimed → show congratulations screen ────────────────────
  const allDone = nameSet && completedIds.size === game.challenges.length && game.challenges.length > 0
  if (allDone) {
    return (
      <NightComplete
        outing={{ id: 'custom', label: game.title || 'Custom Game', emoji: '🎯' }}
        difficulty={{ id: 'custom', label: 'Custom' }}
        xpEarned={myPts}
        tasksCompleted={completedIds.size}
        totalXP={totalXP}
        onReturnHome={onBack}
        onPlayAgain={() => setCompletedIds(new Set())}
      />
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl border border-quest-border text-gray-500 hover:text-gray-200 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="font-display text-xs uppercase tracking-widest text-gray-600">Playing as</p>
          <p className="font-display text-sm font-bold text-white">{playerName}</p>
        </div>
        <button onClick={copyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-quest-border font-display text-[10px] uppercase tracking-widest text-gray-500 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          {copiedCode ? <CheckCircle size={10} className="text-green-400" /> : <Copy size={10} />}
          {game.code}
        </button>
      </div>

      {/* Score */}
      <div className="bg-quest-panel border border-quest-border rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Your Points</p>
          <p className="font-display text-2xl font-black text-quest-gold">{myPts}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Total Claimed</p>
          <p className="font-display text-lg font-bold text-gray-400">{completedIds.size}/{game.challenges.length}</p>
        </div>
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 px-1">Challenges</p>
        {game.challenges.map((c, i) => {
          const done = completedIds.has(c.id)
          const active = activeIdx === i
          return (
            <div key={c.id}>
              <button
                onClick={() => !done && setActiveIdx(active ? null : i)}
                className={`w-full text-left p-4 rounded-xl border transition-all btn-press ${done ? 'opacity-40 bg-quest-bg border-quest-border cursor-default' : active ? 'bg-quest-panel border-quest-gold/40' : 'bg-quest-panel border-quest-border hover:border-quest-gold-dim'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className={`font-display text-xs font-bold mt-0.5 ${done ? 'text-green-500' : 'text-gray-600'}`}>
                      {done ? '✓' : `${i + 1}.`}
                    </span>
                    <div>
                      <p className={`font-display text-sm font-bold ${done ? 'line-through text-gray-600' : 'text-white'}`}>{c.title}</p>
                      {(active || !c.desc) ? null : <p className="font-body text-xs text-gray-600 mt-0.5 line-clamp-1">{c.desc}</p>}
                    </div>
                  </div>
                  <span className={`font-display text-sm font-black shrink-0 ${done ? 'text-gray-600' : 'text-quest-gold'}`}>{c.points}</span>
                </div>
              </button>
              {active && !done && (
                <div className="mt-1 mx-1 bg-quest-bg border border-quest-gold/20 rounded-xl p-3 space-y-3 animate-fade-in">
                  {c.desc && <p className="font-body text-sm text-gray-300 leading-relaxed">{c.desc}</p>}
                  <button onClick={() => handleClaim(c)}
                    className="w-full py-2.5 rounded-lg font-display text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-green-700 to-green-600 btn-press">
                    <CheckCircle size={12} className="inline mr-1.5" />
                    Claim {c.points} Points
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main CustomMode ───────────────────────────────────────────────────────────
export default function CustomMode({ onComplete }) {
  const [view, setView] = useState('menu')   // menu | create | published | join | play
  const [publishedGame, setPublishedGame] = useState(null)
  const [activeGame, setActiveGame] = useState(null)

  const handlePublish = (game) => { setPublishedGame(game); setView('published') }
  const handleJoin    = (game) => { setActiveGame(game); setView('play') }
  const handlePlay    = (game) => { setActiveGame(game); setView('play') }

  const handleComplete = (challenge) => {
    onComplete({ xp: challenge.points, title: challenge.title })
  }

  if (view === 'create')    return <div className="space-y-4 pb-4"><Creator onPublish={handlePublish} /></div>
  if (view === 'published') return <div className="space-y-4 pb-4"><PublishedConfirm game={publishedGame} onReset={() => setView('create')} onPlay={handlePlay} /></div>
  if (view === 'join')      return <div className="space-y-4 pb-4"><JoinView onJoin={handleJoin} /></div>
  if (view === 'play')      return <div className="space-y-4 pb-4"><GamePlayer game={activeGame} onBack={() => setView('menu')} onComplete={handleComplete} /></div>

  // Menu
  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      <div className="text-center pt-2 pb-1">
        <h2 className="font-display text-lg font-black text-white">Custom Game</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Build your own challenges and share with friends</p>
      </div>

      <button onClick={() => setView('create')}
        className="w-full flex items-center gap-4 p-5 bg-quest-panel border border-quest-border rounded-2xl hover:border-quest-gold-dim transition-all btn-press text-left"
        style={{ boxShadow: '0 0 20px rgba(240,192,96,0.05)' }}>
        <div className="w-12 h-12 rounded-xl bg-quest-gold/10 border border-quest-gold/20 flex items-center justify-center shrink-0">
          <Edit3 size={20} className="text-quest-gold" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white">Create a Game</p>
          <p className="font-body text-xs text-gray-500 mt-0.5">Build challenges, assign points, get an access code</p>
        </div>
      </button>

      <button onClick={() => setView('join')}
        className="w-full flex items-center gap-4 p-5 bg-quest-panel border border-quest-border rounded-2xl hover:border-purple-800 transition-all btn-press text-left">
        <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-800/40 flex items-center justify-center shrink-0">
          <LogIn size={20} className="text-purple-400" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white">Join a Game</p>
          <p className="font-body text-xs text-gray-500 mt-0.5">Enter a 6-character code to join someone's game</p>
        </div>
      </button>

      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 flex gap-3">
        <Users size={14} className="text-gray-600 shrink-0 mt-0.5" />
        <p className="font-body text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-300 font-semibold not-italic">How it works: </span>
          Create a game and share the code. Everyone enters the same code, claims points as they complete challenges, and scores track in real time.
        </p>
      </div>
    </div>
  )
}
