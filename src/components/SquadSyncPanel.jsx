/**
 * SquadSyncPanel — real-time squad leaderboard
 *
 * Displays squad members ranked by XP (tiebreak: tasks completed).
 * Flashes a row in gold whenever that member completes a task.
 * Shows contextual summary: "You're in the lead" / "45 XP behind Alice".
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp, WifiOff, Loader, Wifi, Trophy, Share2, CheckCircle, UserPlus, Crown, UserX, EyeOff, Eye } from 'lucide-react'

// ─── Rank medal (top 3 only) ──────────────────────────────────────────────────
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

// ─── Sort + assign ranks ──────────────────────────────────────────────────────
function rankMembers(memberList) {
  return [...memberList]
    .sort((a, b) => {
      const xpDiff = (b.xpEarned ?? 0) - (a.xpEarned ?? 0)
      if (xpDiff !== 0) return xpDiff
      return (b.completedIds?.length ?? 0) - (a.completedIds?.length ?? 0)
    })
    .map((m, i) => ({ ...m, rank: i + 1 }))
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────
function MiniBar({ done, total, color, flash }) {
  const pct = total > 0 ? Math.min(Math.round((done / total) * 100), 100) : 0
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-600"
        style={{
          width: `${pct}%`,
          background: flash ? '#f0c060' : (color ?? '#374151'),
          boxShadow: flash ? '0 0 6px rgba(240,192,96,0.8)' : 'none',
          transition: 'width 0.5s ease, background 0.3s ease, box-shadow 0.3s ease',
        }} />
    </div>
  )
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  if (status === 'live')       return <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" style={{ boxShadow: '0 0 5px #4ade80' }} />
  if (status === 'connecting') return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
  return                              <span className="w-2 h-2 rounded-full bg-gray-700 shrink-0" />
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SquadSyncPanel({ memberList, myKey, syncStatus, roomCode, diffColor, roomUrl, roomPlayerCount, hostKey, onKick }) {
  const [expanded,    setExpanded]    = useState(true)
  const [linkCopied,  setLinkCopied]  = useState(false)
  const [mutedKeys,   setMutedKeys]   = useState(new Set())   // host-only local mute
  const [kickConfirm, setKickConfirm] = useState(null)        // { key, name } | null
  const isHost = !!hostKey && myKey === hostKey

  const handleInvite = async () => {
    if (!roomUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my NightQuest squad',
          text:  `Room code: ${roomCode} — tap to join`,
          url:   roomUrl,
        })
        return
      } catch (e) { if (e?.name === 'AbortError') return }
    }
    try {
      await navigator.clipboard.writeText(roomUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2200)
    } catch { window.prompt('Copy this squad invite link:', roomUrl) }
  }

  const spotsLeft = roomPlayerCount != null ? roomPlayerCount - memberList.length : null

  // Track which keys are currently flashing (completed a task just now)
  const [flashingKeys, setFlashingKeys] = useState(new Set())
  const prevCountsRef = useRef({})  // key → last seen completedIds.length
  const firstSeenRef  = useRef(new Set())  // keys seen at least once (avoid flash on join)

  // Track previous ranks for rank-change indicator
  const prevRanksRef = useRef({})   // key → last rank

  // Detect task completions → trigger flash
  useEffect(() => {
    if (syncStatus !== 'live') return

    const newFlashing = []
    for (const m of memberList) {
      const current  = m.completedIds?.length ?? 0
      const previous = prevCountsRef.current[m.key]
      const seenBefore = firstSeenRef.current.has(m.key)

      if (seenBefore && previous !== undefined && current > previous) {
        newFlashing.push(m.key)
      }
      firstSeenRef.current.add(m.key)
      prevCountsRef.current[m.key] = current
    }

    if (newFlashing.length === 0) return

    setFlashingKeys(prev => new Set([...prev, ...newFlashing]))
    const timer = setTimeout(() => {
      setFlashingKeys(prev => {
        const next = new Set(prev)
        newFlashing.forEach(k => next.delete(k))
        return next
      })
    }, 1450)
    return () => clearTimeout(timer)
  }, [memberList, syncStatus])

  // Ranked list (recomputed whenever memberList changes)
  const ranked = useMemo(() => rankMembers(memberList), [memberList])

  // My own entry
  const me       = ranked.find(m => m.key === myKey)
  const myRank   = me?.rank ?? null
  const myPrev   = prevRanksRef.current[myKey]
  const rankUp   = myPrev !== undefined && myRank !== null && myRank < myPrev

  // Update prev ranks
  useEffect(() => {
    for (const m of ranked) prevRanksRef.current[m.key] = m.rank
  }, [ranked])

  // Summary line for header
  const summaryLine = useMemo(() => {
    if (syncStatus !== 'live') return null
    if (ranked.length === 0)   return null
    if (!me) return null
    if (myRank === 1) {
      return ranked.length > 1
        ? `You're in the lead 🔥`
        : `You're online · Waiting for squad`
    }
    const above = ranked[myRank - 2]  // rank is 1-indexed; above is at index rank-2
    if (!above) return null
    const gap = (above.xpEarned ?? 0) - (me.xpEarned ?? 0)
    const aboveName = above.playerName ?? `Player ${(above.playerIdx ?? 0) + 1}`
    return gap > 0
      ? `You're #${myRank} · ${gap} XP behind ${aboveName}`
      : `Tied with ${aboveName}`
  }, [ranked, me, myRank, syncStatus])

  const onlineCount = memberList.length
  const isLive      = syncStatus === 'live'

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{
        borderColor: isLive ? 'rgba(240,192,96,0.2)' : 'rgba(255,255,255,0.06)',
        background:  isLive ? 'rgba(240,192,96,0.03)' : 'rgba(255,255,255,0.02)',
      }}>

      {/* ── Header row (always visible) ──────────────────────────────────── */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setExpanded(e => !e)}>

        <StatusDot status={syncStatus} />

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Trophy size={10} className={isLive ? 'text-quest-gold' : 'text-gray-700'} />
            <span className="font-display text-[10px] font-bold uppercase tracking-wider"
              style={{ color: isLive ? '#f0c060' : '#6b7280' }}>
              Leaderboard
            </span>
            {isLive && onlineCount > 0 && (
              <span className="font-display text-[9px] text-gray-600 uppercase tracking-wider">
                · {onlineCount} online
              </span>
            )}
            {roomCode && (
              <span className="font-display text-[9px] text-gray-700 uppercase tracking-widest ml-1">
                · {roomCode}
              </span>
            )}
          </div>

          {summaryLine && (
            <p className="font-body text-[10px] text-gray-500 italic mt-0.5 truncate">{summaryLine}</p>
          )}
        </div>

        {rankUp && (
          <span className="text-green-400 font-display text-[9px] font-bold uppercase tracking-widest shrink-0 animate-fade-in">
            ↑ Rank up!
          </span>
        )}

        <span style={{ color: isLive ? '#f0c06088' : '#4b5563' }} className="shrink-0">
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      {/* ── Expanded leaderboard ─────────────────────────────────────────── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-1.5 animate-fade-in">
          <div className="h-px bg-gray-800/60 mb-2" />

          {/* ── Loading / empty states ─────────────────────────────────── */}
          {syncStatus === 'connecting' && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader size={12} className="text-gray-600 animate-spin" />
              <p className="font-display text-[10px] text-gray-600 uppercase tracking-wider">Joining leaderboard…</p>
            </div>
          )}
          {(syncStatus === 'offline') && (
            <div className="flex items-center justify-center gap-2 py-2">
              <WifiOff size={12} className="text-gray-700" />
              <p className="font-display text-[10px] text-gray-700 uppercase tracking-wider">Live sync offline</p>
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Wifi size={12} className="text-amber-700 animate-pulse" />
              <p className="font-display text-[10px] text-amber-700 uppercase tracking-wider">Reconnecting…</p>
            </div>
          )}
          {isLive && ranked.length === 0 && (
            <p className="font-display text-[10px] text-gray-600 text-center py-2 uppercase tracking-wider">
              Waiting for squad to join…
            </p>
          )}

          {/* ── Ranked rows ───────────────────────────────────────────── */}
          {isLive && ranked
            .filter(m => !mutedKeys.has(m.key))   // host-only local mute
            .map(member => {
            const isMyRow  = member.key === myKey
            const isHostRow = !!hostKey && member.key === hostKey
            const done     = member.completedIds?.length ?? 0
            const total    = member.totalTasks ?? 1
            const xp       = member.xpEarned ?? 0
            const name     = member.playerName ?? `Player ${(member.playerIdx ?? 0) + 1}`
            const flash    = flashingKeys.has(member.key)
            const allDone  = done >= total && total > 0
            const medal    = MEDALS[member.rank]

            return (
              <div key={member.key}
                className={`px-2.5 py-2 rounded-lg transition-all ${flash ? 'leader-flash' : ''} ${isMyRow ? 'border' : ''}`}
                style={isMyRow
                  ? { borderColor: `${diffColor}40`, background: `${diffColor}0a` }
                  : {}
                }>

                <div className="flex items-center gap-2">

                  {/* ── Rank badge ─────────────────────────────── */}
                  <div className="w-6 text-center shrink-0">
                    {medal
                      ? <span className="text-sm leading-none">{medal}</span>
                      : <span className="font-display text-[10px] font-black text-gray-600">#{member.rank}</span>
                    }
                  </div>

                  {/* ── Name ───────────────────────────────────── */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-display text-xs font-bold truncate ${isMyRow ? 'text-white' : 'text-gray-400'}`}>
                        {name}
                      </span>
                      {isHostRow && (
                        <Crown size={10} className="text-quest-gold shrink-0" title="Host" />
                      )}
                      {isMyRow && (
                        <span className="font-display text-[8px] uppercase tracking-widest px-1 py-0.5 rounded shrink-0"
                          style={{ color: diffColor, background: `${diffColor}20` }}>
                          You
                        </span>
                      )}
                      {allDone && (
                        <span className="text-[10px] shrink-0">✓</span>
                      )}
                      {flash && (
                        <span className="font-display text-[8px] uppercase tracking-widest text-quest-gold animate-fade-in shrink-0">
                          +XP
                        </span>
                      )}
                    </div>

                    {/* ── Progress bar ───────────────────────── */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <MiniBar
                        done={done}
                        total={total}
                        color={isMyRow ? diffColor : '#374151'}
                        flash={flash}
                      />
                      <span className="font-display text-[9px] text-gray-600 shrink-0 tabular-nums">
                        {done}/{total}
                      </span>
                    </div>
                  </div>

                  {/* ── XP ─────────────────────────────────────── */}
                  <div className="text-right shrink-0">
                    <span className={`font-display text-sm font-black tabular-nums ${isMyRow ? 'text-quest-gold' : flash ? 'text-quest-gold' : 'text-gray-500'}`}>
                      {xp}
                    </span>
                    <p className="font-display text-[8px] uppercase tracking-wider text-gray-700">XP</p>
                  </div>

                  {/* ── Host controls (mute / kick) ────────────── */}
                  {isHost && !isMyRow && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => setMutedKeys(prev => {
                          const next = new Set(prev); next.add(member.key); return next
                        })}
                        title="Hide from your leaderboard"
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-700 hover:text-gray-400 transition-colors">
                        <EyeOff size={10} />
                      </button>
                      <button
                        onClick={() => setKickConfirm({ key: member.key, name })}
                        title="Remove from squad"
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-700 hover:text-red-400 transition-colors">
                        <UserX size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── Show muted-by-host reveal row ─────────────────────────── */}
          {isHost && mutedKeys.size > 0 && (
            <button onClick={() => setMutedKeys(new Set())}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-display text-[9px] uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors">
              <Eye size={9} /> Show {mutedKeys.size} hidden member{mutedKeys.size !== 1 ? 's' : ''}
            </button>
          )}

          {/* ── Kick confirmation modal ───────────────────────────────── */}
          {kickConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(4px)' }}
              onClick={() => setKickConfirm(null)}>
              <div className="w-full max-w-xs bg-quest-panel border border-quest-border rounded-2xl p-5 text-center animate-slide-up"
                onClick={e => e.stopPropagation()}>
                <UserX size={28} className="text-red-400 mx-auto mb-3" />
                <p className="font-display text-sm font-bold text-white mb-1">Remove from squad?</p>
                <p className="font-body text-xs text-gray-500 mb-5">
                  <span className="text-white">{kickConfirm.name}</span> will be disconnected from the squad room.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setKickConfirm(null)}
                    className="flex-1 py-2 rounded-lg border border-quest-border text-gray-400 font-display text-xs uppercase tracking-wider hover:text-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => {
                      onKick?.(kickConfirm.key)
                      setMutedKeys(prev => { const next = new Set(prev); next.add(kickConfirm.key); return next })
                      setKickConfirm(null)
                    }}
                    className="flex-1 py-2 rounded-lg bg-red-900/40 border border-red-700/40 text-red-300 font-display text-xs uppercase tracking-wider hover:bg-red-900/60 transition-colors btn-press">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer: gap to leader ─────────────────────────────────── */}
          {isLive && ranked.length > 1 && me && myRank > 1 && (() => {
            const leader = ranked[0]
            const gap    = (leader.xpEarned ?? 0) - (me.xpEarned ?? 0)
            if (gap <= 0) return null
            const leaderName = leader.playerName ?? `Player ${(leader.playerIdx ?? 0) + 1}`
            return (
              <div className="flex items-center justify-center gap-1 pt-1">
                <div className="h-px flex-1 bg-gray-800" />
                <p className="font-display text-[9px] text-gray-700 uppercase tracking-wider px-2 text-center">
                  {gap} XP from {leaderName}
                </p>
                <div className="h-px flex-1 bg-gray-800" />
              </div>
            )
          })()}

          {/* ── Invite section ─────────────────────────────────────────── */}
          {roomUrl && (
            <div className="mt-1 space-y-2">
              {/* Prominent banner when spots are still open */}
              {spotsLeft != null && spotsLeft > 0 && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)' }}>
                  <UserPlus size={11} className="text-purple-400 shrink-0" />
                  <p className="font-display text-[9px] uppercase tracking-wider text-purple-400 flex-1">
                    {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} open
                  </p>
                  <button onClick={handleInvite}
                    className="flex items-center gap-1 px-2 py-1 rounded font-display text-[9px] uppercase tracking-widest btn-press transition-all"
                    style={{
                      background: linkCopied ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.2)',
                      color:       linkCopied ? '#4ade80' : '#a78bfa',
                      border:      linkCopied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(124,58,237,0.3)',
                    }}>
                    {linkCopied
                      ? <><CheckCircle size={9} /> Copied</>
                      : <><Share2 size={9} /> Invite</>}
                  </button>
                </div>
              )}

              {/* Always-available share button */}
              {(spotsLeft === null || spotsLeft <= 0) && (
                <button onClick={handleInvite}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-display text-[10px] uppercase tracking-wider transition-all btn-press"
                  style={{
                    background: linkCopied ? 'rgba(34,197,94,0.10)' : 'rgba(240,192,96,0.08)',
                    color:       linkCopied ? '#4ade80' : '#d4a849',
                    border:      linkCopied ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(240,192,96,0.15)',
                  }}>
                  {linkCopied
                    ? <><CheckCircle size={10} /> Link copied!</>
                    : <><Share2 size={10} /> Share Invite · {roomCode}</>}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
