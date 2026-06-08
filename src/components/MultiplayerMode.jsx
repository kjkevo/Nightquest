import { useState, useCallback } from 'react'
import { Users, Shuffle, Edit3, Check } from 'lucide-react'
import QuestCard from './QuestCard'
import { pickRandomQuest, filterQuests } from '../data/quests'

const PLAYER_COLORS = [
  'text-blue-400',
  'text-purple-400',
  'text-pink-400',
  'text-orange-400',
  'text-green-400',
  'text-yellow-400',
]

function PlayerCountPicker({ count, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-xs uppercase tracking-wider text-gray-500 mr-1">Players</span>
      {[2, 3, 4, 5, 6].map(n => (
        <button key={n} onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-lg font-display text-sm font-bold transition-all btn-press border
            ${count === n
              ? 'bg-quest-gold text-quest-bg border-quest-gold shadow-lg'
              : 'bg-quest-panel border-quest-border text-gray-400 hover:border-quest-gold-dim hover:text-quest-gold'}`}>
          {n}
        </button>
      ))}
    </div>
  )
}

function EditableName({ name, color, onChange }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(name)

  const commit = () => { onChange(val || name); setEditing(false) }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          maxLength={16}
          className="bg-quest-panel border border-quest-gold-dim rounded px-2 py-0.5 font-display text-xs text-quest-gold w-24 outline-none"
        />
        <button onClick={commit} className="text-green-400 hover:text-green-300"><Check size={12} /></button>
      </div>
    )
  }
  return (
    <button onClick={() => setEditing(true)} className={`flex items-center gap-1 group ${color}`}>
      <span className="font-display text-xs font-bold uppercase tracking-wider">{name}</span>
      <Edit3 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  )
}

export default function MultiplayerMode({ activeCategory, onComplete }) {
  const [playerCount, setPlayerCount] = useState(3)
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'])
  const [assignments, setAssignments] = useState([]) // [{ player, quest }]
  const [dealt, setDealt] = useState(false)

  const handlePlayerCountChange = useCallback((n) => {
    setPlayerCount(n)
    setDealt(false)
    setAssignments([])
  }, [])

  const dealQuests = useCallback(() => {
    const pool = filterQuests(activeCategory)
    const picks = []
    const usedIds = new Set()

    for (let i = 0; i < playerCount; i++) {
      let quest
      let attempts = 0
      do {
        const excludeId = picks[picks.length - 1]?.quest?.id ?? null
        quest = pickRandomQuest(pool.filter(q => !usedIds.has(q.id)), excludeId)
        attempts++
      } while (usedIds.has(quest?.id) && attempts < 20)

      usedIds.add(quest?.id)
      picks.push({ player: playerNames[i], quest })
    }

    setAssignments(picks)
    setDealt(true)
  }, [playerCount, playerNames, activeCategory])

  const renamePayer = useCallback((i, name) => {
    setPlayerNames(prev => { const n = [...prev]; n[i] = name; return n })
    if (assignments[i]) {
      setAssignments(prev => {
        const a = [...prev]; a[i] = { ...a[i], player: name }; return a
      })
    }
  }, [assignments])

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={14} className="text-quest-gold" />
          <span className="font-display text-sm font-bold text-gray-200 uppercase tracking-wider">Party Setup</span>
        </div>

        <PlayerCountPicker count={playerCount} onChange={handlePlayerCountChange} />

        {/* Name editors */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className="bg-quest-bg border border-quest-border rounded-lg px-3 py-1.5">
              <EditableName
                name={playerNames[i]}
                color={PLAYER_COLORS[i]}
                onChange={name => renamePayer(i, name)} />
            </div>
          ))}
        </div>

        <button onClick={dealQuests}
          className="relative group w-full btn-press">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-quest-gold opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
          <div className="relative flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-display text-sm font-bold uppercase tracking-widest bg-quest-bg border border-quest-border text-quest-gold hover:border-quest-gold-dim transition-colors">
            <Shuffle size={15} />
            {dealt ? 'Redeal Quests' : 'Deal Quests'}
          </div>
        </button>
      </div>

      {/* Quest cards grid */}
      {dealt && (
        <div className={`grid gap-4 ${playerCount >= 3 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {assignments.map(({ player, quest }, i) => (
            <QuestCard
              key={`${player}-${quest.id}-${i}`}
              quest={quest}
              playerLabel={<span className={PLAYER_COLORS[i]}>{player}</span>}
              onComplete={onComplete}
              compact={playerCount >= 4}
            />
          ))}
        </div>
      )}

      {!dealt && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-quest-panel border border-quest-border flex items-center justify-center mb-3">
            <Users size={28} className="text-gray-600" />
          </div>
          <p className="font-display text-gray-600 text-xs uppercase tracking-wider">Deal quests to begin</p>
        </div>
      )}
    </div>
  )
}
