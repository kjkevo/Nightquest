import { useState, useCallback } from 'react'
import {
  Users, Copy, LogOut, CheckCircle, X, Plus, Trash2,
  DollarSign, MapPin, Shield, ChevronDown, ChevronUp,
  Share2, Car, AlertCircle, Check,
} from 'lucide-react'
import { useSquad, STATUSES } from '../hooks/useSquad'
import { useCosts, EXPENSE_CATEGORIES } from '../hooks/useCosts'
import SquadMap from './SquadMap'
import { VENUES } from '../data/venues'

// ─── Room Join / Create screen ────────────────────────────────────────────────
function RoomGate({ onCreate, onJoin }) {
  const [code, setCode] = useState('')
  const [mode, setMode] = useState(null) // null | 'join'

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-5">
      <div className="w-20 h-20 rounded-2xl bg-quest-panel border border-quest-border flex items-center justify-center animate-float"
        style={{ boxShadow: '0 0 30px rgba(124,58,237,0.3)' }}>
        <Users size={36} className="text-purple-400" />
      </div>
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-quest-gold">Squad Night</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Create or join a room to coordinate with your crew</p>
      </div>

      <div className="w-full space-y-3">
        <button onClick={onCreate}
          className="relative group w-full btn-press">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-quest-gold opacity-40 blur-sm group-hover:opacity-70 transition-opacity" />
          <div className="relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-display text-sm font-bold uppercase tracking-widest bg-quest-bg border border-quest-gold-dim text-quest-gold hover:border-quest-gold transition-colors">
            <Plus size={15} /> Create Room
          </div>
        </button>

        {mode !== 'join' ? (
          <button onClick={() => setMode('join')}
            className="w-full py-3.5 rounded-xl border border-quest-border font-display text-sm uppercase tracking-widest text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all btn-press">
            Join a Room
          </button>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="ENTER ROOM CODE"
              onKeyDown={e => e.key === 'Enter' && code.length >= 4 && onJoin(code)}
              className="w-full bg-quest-panel border border-quest-border rounded-xl px-4 py-3 font-display text-center text-lg tracking-[0.4em] text-quest-gold placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors"
            />
            <div className="flex gap-2">
              <button onClick={() => setMode(null)}
                className="px-4 py-2.5 rounded-xl border border-quest-border text-gray-500 font-display text-xs uppercase tracking-wider btn-press">
                Cancel
              </button>
              <button
                disabled={code.length < 4}
                onClick={() => onJoin(code)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-widest disabled:opacity-30 btn-press">
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-700 font-body text-center">
        Share your room code with friends so they can join and coordinate in real-time
      </p>
    </div>
  )
}

// ─── Room Header ──────────────────────────────────────────────────────────────
function RoomHeader({ room, memberCount, allHomeSafe, onLeave }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard?.writeText(room.code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-quest-panel border border-quest-border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Room Code</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-display text-2xl font-black tracking-[0.25em] text-quest-gold">{room.code}</span>
            <button onClick={copyCode}
              className="text-gray-600 hover:text-quest-gold transition-colors">
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
            <button onClick={() => navigator.share?.({ title: 'NightQuest Room', text: `Join my NightQuest room: ${room.code}` })}
              className="text-gray-600 hover:text-quest-gold transition-colors">
              <Share2 size={13} />
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-display text-xs text-gray-400">{memberCount + 1} online</span>
          </div>
          {allHomeSafe && (
            <span className="text-[10px] text-green-400 font-display uppercase tracking-wider">✅ All Home Safe</span>
          )}
          <button onClick={onLeave}
            className="flex items-center gap-1 mt-1 text-[10px] text-red-500/60 hover:text-red-400 font-display uppercase tracking-wider transition-colors">
            <LogOut size={9} /> Leave
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Broadcast ─────────────────────────────────────────────────────────
function StatusBroadcast({ myStatus, onBroadcast }) {
  const quickStatuses = ['getting_ready', 'heading_out', 'at_pregame', 'out', 'at_venue', 'ride_home', 'home_safe']

  return (
    <div className="space-y-2">
      <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 px-1">Broadcast My Status</p>
      {/* Big safe ride button */}
      <button
        onClick={() => onBroadcast('ride_home')}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest border-2 transition-all btn-press
          ${myStatus === 'ride_home'
            ? 'bg-cyan-900/40 border-cyan-600 text-cyan-300'
            : 'border-cyan-900/60 text-cyan-500 hover:bg-cyan-900/20 hover:border-cyan-700/60'}`}>
        <Car size={16} />
        {myStatus === 'ride_home' ? "🚗 Ride home alert sent!" : "I'm Grabbing a Ride Home"}
        <Shield size={12} className="opacity-60" />
      </button>
      {/* Quick status grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {quickStatuses.filter(s => s !== 'ride_home').map(key => {
          const s = STATUSES[key]
          const isActive = myStatus === key
          return (
            <button key={key} onClick={() => onBroadcast(key)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border font-display text-[9px] uppercase tracking-wide transition-all btn-press
                ${isActive
                  ? 'border-opacity-80 scale-95'
                  : 'border-quest-border text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
              style={isActive ? { borderColor: s.color, background: s.color + '22', color: s.color } : {}}>
              <span className="text-base leading-none">{s.emoji}</span>
              <span className="leading-tight text-center">{s.label.split(' ').slice(-1)[0]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Member List ──────────────────────────────────────────────────────────────
function MemberList({ members, myStatus }) {
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60)  return 'just now'
    if (s < 3600) return `${Math.floor(s/60)}m ago`
    return `${Math.floor(s/3600)}h ago`
  }

  const me = { id: 'me', name: 'You', emoji: '⭐', color: '#f0c060', status: myStatus, lastSeen: Date.now() }
  const all = [me, ...members]

  return (
    <div className="space-y-1.5">
      {all.map(m => {
        const s = STATUSES[m.status] || STATUSES.home
        return (
          <div key={m.id} className="flex items-center gap-3 bg-quest-panel border border-quest-border rounded-xl px-3.5 py-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 border"
              style={{ background: m.color + '22', borderColor: m.color + '55' }}>
              {m.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold text-white">{m.name}</span>
                {m.id === 'me' && <span className="text-[9px] text-gray-600 font-display uppercase tracking-wider">(you)</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs">{s.emoji}</span>
                <span className="font-body text-xs" style={{ color: s.color }}>{s.label}</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-700 font-body shrink-0">{timeAgo(m.lastSeen)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Voting Section ───────────────────────────────────────────────────────────
function VotingSection({ proposals, votes, members, onVote }) {
  return (
    <div className="space-y-3">
      {proposals.map(p => {
        const pVotes = votes[p.id] || {}
        const allVoters = ['me', ...members.map(m => m.id)]
        const yes    = Object.values(pVotes).filter(v => v === '✅').length
        const no     = Object.values(pVotes).filter(v => v === '❌').length
        const unsure = Object.values(pVotes).filter(v => v === '🤔').length
        const total  = allVoters.length
        const myVote = pVotes['me']
        const approved = yes > total / 2

        return (
          <div key={p.id} className={`rounded-xl border overflow-hidden transition-all ${approved ? 'border-green-700/50' : 'border-quest-border'}`}
            style={{ background: approved ? 'rgba(34,197,94,0.05)' : 'rgba(18,18,30,1)' }}>
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-display text-xs font-bold text-gray-200 leading-snug">{p.text}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Proposed by {members.find(m => m.id === p.proposedBy)?.name || p.proposedBy}</p>
                </div>
                {approved && <span className="shrink-0 text-[10px] font-display text-green-400 uppercase tracking-wider bg-green-900/30 border border-green-700/40 px-2 py-0.5 rounded-full">Approved</span>}
              </div>
              {/* Vote bars */}
              <div className="space-y-1 mb-3">
                {[['✅', yes, '#22c55e'], ['❌', no, '#ef4444'], ['🤔', unsure, '#eab308']].map(([emoji, count, color]) => (
                  <div key={emoji} className="flex items-center gap-2">
                    <span className="text-xs w-4">{emoji}</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: total ? `${(count / total) * 100}%` : '0%', background: color }} />
                    </div>
                    <span className="text-[10px] text-gray-600 w-3 font-display">{count}</span>
                  </div>
                ))}
              </div>
              {/* My vote buttons */}
              <div className="flex gap-2">
                {[['✅', 'Yes!'], ['❌', 'No'], ['🤔', 'Unsure']].map(([vote, label]) => (
                  <button key={vote} onClick={() => onVote(p.id, vote)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border font-display text-[10px] uppercase tracking-wider transition-all btn-press
                      ${myVote === vote
                        ? 'border-quest-gold bg-quest-gold/15 text-quest-gold'
                        : 'border-quest-border text-gray-500 hover:border-gray-500'}`}>
                    {vote} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Cost Tracker ─────────────────────────────────────────────────────────────
function CostTracker({ members }) {
  const { expenses, balances, settleUp, totalSpend, allParticipants, addExpense, removeExpense, clearAll } = useCosts(members)
  const [showAdd, setShowAdd] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [form, setForm] = useState({ desc: '', amount: '', category: 'round', paidBy: 'me', splitBetween: [] })

  const toggleSplit = (id) => {
    setForm(f => ({
      ...f,
      splitBetween: f.splitBetween.includes(id)
        ? f.splitBetween.filter(x => x !== id)
        : [...f.splitBetween, id],
    }))
  }

  const submitExpense = () => {
    if (!form.desc || !form.amount || isNaN(Number(form.amount))) return
    const split = form.splitBetween.length ? form.splitBetween : allParticipants.map(p => p.id)
    addExpense({ desc: form.desc, amount: Number(form.amount), category: form.category, paidBy: form.paidBy, splitBetween: split })
    setForm({ desc: '', amount: '', category: 'round', paidBy: 'me', splitBetween: [] })
    setShowAdd(false)
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-quest-panel border border-quest-border rounded-xl p-2.5 text-center">
          <p className="font-display text-lg font-black text-quest-gold">${totalSpend.toFixed(0)}</p>
          <p className="text-[9px] text-gray-600 uppercase tracking-wider font-display">Total</p>
        </div>
        <div className="bg-quest-panel border border-quest-border rounded-xl p-2.5 text-center">
          <p className="font-display text-lg font-black text-white">{expenses.length}</p>
          <p className="text-[9px] text-gray-600 uppercase tracking-wider font-display">Expenses</p>
        </div>
        <div className="bg-quest-panel border border-quest-border rounded-xl p-2.5 text-center">
          <p className="font-display text-lg font-black text-white">{allParticipants.length}</p>
          <p className="text-[9px] text-gray-600 uppercase tracking-wider font-display">Splitting</p>
        </div>
      </div>

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {expenses.map(exp => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category) || EXPENSE_CATEGORIES[4]
            const paidByName = allParticipants.find(p => p.id === exp.paidBy)?.name || exp.paidBy
            return (
              <div key={exp.id} className="flex items-center gap-2 bg-quest-panel border border-quest-border rounded-xl px-3 py-2">
                <span className="text-base shrink-0">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs text-gray-200 truncate">{exp.desc}</p>
                  <p className="text-[10px] text-gray-600">Paid by {paidByName} · split {exp.splitBetween.length} ways</p>
                </div>
                <span className="font-display text-sm font-bold text-white shrink-0">${exp.amount.toFixed(2)}</span>
                <button onClick={() => removeExpense(exp.id)} className="text-gray-700 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add expense form */}
      {showAdd && (
        <div className="bg-quest-bg border border-quest-border rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="font-display text-xs uppercase tracking-widest text-gray-500">Add Expense</p>
          {/* Category */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {EXPENSE_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full border font-display text-[10px] uppercase tracking-wider transition-all btn-press
                  ${form.category === c.id ? 'text-quest-bg font-bold' : 'border-quest-border text-gray-500'}`}
                style={form.category === c.id ? { background: c.color, borderColor: c.color } : {}}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              placeholder="Description…"
              className="flex-1 bg-quest-panel border border-quest-border rounded-lg px-3 py-2 font-body text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold-dim" />
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 font-display text-sm">$</span>
              <input type="number" min="0" step="0.5" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-20 bg-quest-panel border border-quest-border rounded-lg pl-6 pr-2 py-2 font-display text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold-dim" />
            </div>
          </div>
          {/* Paid by */}
          <div>
            <p className="text-[10px] text-gray-600 font-display uppercase tracking-wider mb-1.5">Paid by</p>
            <div className="flex gap-1.5 flex-wrap">
              {allParticipants.map(p => (
                <button key={p.id} onClick={() => setForm(f => ({ ...f, paidBy: p.id }))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-display text-[10px] uppercase tracking-wider transition-all btn-press
                    ${form.paidBy === p.id ? 'bg-quest-gold text-quest-bg border-quest-gold font-bold' : 'border-quest-border text-gray-500'}`}>
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>
          {/* Split between */}
          <div>
            <p className="text-[10px] text-gray-600 font-display uppercase tracking-wider mb-1.5">Split between (default: everyone)</p>
            <div className="flex gap-1.5 flex-wrap">
              {allParticipants.map(p => (
                <button key={p.id} onClick={() => toggleSplit(p.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-display text-[10px] uppercase tracking-wider transition-all btn-press
                    ${form.splitBetween.includes(p.id) ? 'bg-purple-900/60 border-purple-600 text-purple-200' : 'border-quest-border text-gray-500'}`}>
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg border border-quest-border text-gray-500 font-display text-xs uppercase tracking-wider btn-press">
              Cancel
            </button>
            <button onClick={submitExpense}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-wider btn-press">
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Settle up */}
      {showSettle && expenses.length > 0 && (
        <div className="bg-quest-bg border border-quest-border rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="font-display text-xs uppercase tracking-widest text-gray-500">End-of-Night Settle Up</p>
          {settleUp.length === 0 ? (
            <div className="text-center py-3">
              <CheckCircle size={24} className="text-green-400 mx-auto mb-1" />
              <p className="font-display text-xs text-green-400 uppercase tracking-wider">All squared up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {settleUp.map((txn, i) => {
                const fromName = allParticipants.find(p => p.id === txn.from)?.name || txn.from
                const toName   = allParticipants.find(p => p.id === txn.to)?.name   || txn.to
                const fromEmoji = allParticipants.find(p => p.id === txn.from)?.emoji || '💸'
                const toEmoji   = allParticipants.find(p => p.id === txn.to)?.emoji   || '💰'
                return (
                  <div key={i} className="flex items-center gap-2 bg-quest-panel border border-quest-border rounded-xl px-3 py-2.5">
                    <span>{fromEmoji}</span>
                    <span className="font-display text-xs font-bold text-red-400">{fromName}</span>
                    <span className="text-gray-600 text-xs flex-1">owes</span>
                    <span className="font-display text-sm font-black text-quest-gold">${txn.amount.toFixed(2)}</span>
                    <span className="text-gray-600 text-xs">to</span>
                    <span className="font-display text-xs font-bold text-green-400">{toName}</span>
                    <span>{toEmoji}</span>
                  </div>
                )
              })}
            </div>
          )}
          {expenses.length > 0 && (
            <button onClick={() => { clearAll(); setShowSettle(false) }}
              className="w-full py-2 rounded-lg border border-red-900/40 text-red-500/60 font-display text-xs uppercase tracking-wider hover:text-red-400 hover:border-red-800/60 transition-all btn-press">
              Clear All & Start Fresh
            </button>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex gap-2">
        <button onClick={() => { setShowAdd(a => !a); setShowSettle(false) }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-quest-gold hover:border-quest-gold-dim transition-all btn-press">
          <Plus size={12} /> Add Expense
        </button>
        <button onClick={() => { setShowSettle(s => !s); setShowAdd(false) }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-quest-border font-display text-xs uppercase tracking-widest text-gray-400 hover:text-green-400 hover:border-green-800/60 transition-all btn-press">
          <DollarSign size={12} /> Settle Up
        </button>
      </div>
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed({ feed }) {
  if (!feed.length) return null
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60)   return 'now'
    if (s < 3600) return `${Math.floor(s/60)}m`
    return `${Math.floor(s/3600)}h`
  }
  return (
    <div className="space-y-1 max-h-36 overflow-y-auto">
      {feed.map(item => (
        <div key={item.id} className="flex items-start gap-2 px-1">
          <span className="shrink-0 text-sm leading-none mt-0.5">{item.emoji || '•'}</span>
          <span className="flex-1 font-body text-xs text-gray-400 leading-snug">{item.text}</span>
          <span className="shrink-0 text-[10px] text-gray-700 font-display">{timeAgo(item.ts)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Section({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-quest-border overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-quest-panel hover:bg-quest-panel/70 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider">{title}</span>
          {badge !== undefined && badge !== null && (
            <span className="bg-quest-gold/20 text-quest-gold border border-quest-gold-dim/40 text-[10px] font-display font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp size={13} className="text-gray-600" /> : <ChevronDown size={13} className="text-gray-600" />}
      </button>
      {open && <div className="p-4 border-t border-quest-border">{children}</div>}
    </div>
  )
}

// ─── Main Squad View ──────────────────────────────────────────────────────────
export default function SquadView() {
  const {
    room, members, myStatus, myMapPos, feed, meetupPins, votes, proposals, allHomeSafe,
    createRoom, joinRoom, leaveRoom, broadcastStatus, castVote,
    addMeetupPin, removeMeetupPin,
  } = useSquad()

  if (!room) {
    return <RoomGate onCreate={createRoom} onJoin={joinRoom} />
  }

  return (
    <div className="space-y-3 pb-2">
      <RoomHeader room={room} memberCount={members.length} allHomeSafe={allHomeSafe} onLeave={leaveRoom} />

      {/* Status broadcast — always visible */}
      <StatusBroadcast myStatus={myStatus} onBroadcast={broadcastStatus} />

      {/* Activity feed */}
      {feed.length > 0 && (
        <Section title="Activity" badge={feed.length}>
          <ActivityFeed feed={feed} />
        </Section>
      )}

      {/* Live map */}
      <Section title="Live Map" defaultOpen={true}>
        <SquadMap
          members={members}
          myMapPos={myMapPos}
          meetupPins={meetupPins}
          venues={VENUES}
          onPinAdd={addMeetupPin}
        />
        {/* Pin list */}
        {meetupPins.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">Meetup Pins</p>
            {meetupPins.map(pin => (
              <div key={pin.id} className="flex items-center gap-2 bg-quest-bg border border-quest-gold/20 rounded-lg px-3 py-2">
                <span className="text-quest-gold">📍</span>
                <span className="flex-1 font-display text-xs text-gray-200">{pin.name}</span>
                <button onClick={() => removeMeetupPin(pin.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Crew */}
      <Section title="Crew" badge={members.length + 1}>
        <MemberList members={members} myStatus={myStatus} />
      </Section>

      {/* Vote on plans */}
      <Section title="Vote on Plans" badge={proposals.length} defaultOpen={false}>
        <VotingSection proposals={proposals} votes={votes} members={members} onVote={castVote} />
      </Section>

      {/* Cost tracker */}
      <Section title="Split Costs" defaultOpen={false}>
        <CostTracker members={members} />
      </Section>
    </div>
  )
}
