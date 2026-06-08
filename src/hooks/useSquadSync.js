/**
 * useSquadSync — live squad progress via Supabase Realtime Presence.
 *
 * Each device tracks its own state on a channel keyed by the 6-char room code.
 * Supabase Presence broadcasts join/leave/update events to every subscriber —
 * no database writes, no user accounts required.
 *
 * Presence state per member:
 *   { playerIdx, playerName, completedIds[], xpEarned, totalTasks, joinedAt }
 *
 * Returns:
 *   members   — object keyed by presenceKey; each value is the member's latest state
 *   syncStatus — 'connecting' | 'live' | 'offline' | 'error'
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'

// Stable device key for this browser session
const SESSION_KEY = (() => {
  try {
    let k = sessionStorage.getItem('nq_pkey')
    if (!k) { k = crypto.randomUUID(); sessionStorage.setItem('nq_pkey', k) }
    return k
  } catch { return crypto.randomUUID() }
})()

/** Exported so room creation can stamp the host key into the room object. */
export function getSessionKey() { return SESSION_KEY }

export function useSquadSync({ roomCode, playerIdx, playerName, completedIds, xpEarned, totalTasks, enabled = true, onKicked }) {
  const [members,    setMembers]    = useState({})
  const [syncStatus, setSyncStatus] = useState('offline')

  const channelRef    = useRef(null)
  const timerRef      = useRef(null)
  const mountedRef    = useRef(true)
  const onKickedRef   = useRef(onKicked)
  useEffect(() => { onKickedRef.current = onKicked }, [onKicked])

  // ── Subscribe / unsubscribe based on roomCode + enabled ─────────────────────
  useEffect(() => {
    mountedRef.current = true

    if (!enabled || !roomCode) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('connecting')

    const channel = supabase.channel(`nq-room-${roomCode}`, {
      config: { presence: { key: SESSION_KEY } },
    })
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!mountedRef.current) return
        // presenceState() returns { presenceKey: [{ ...state }], ... }
        // Flatten to { presenceKey: latestState }
        const raw = channel.presenceState()
        const flat = {}
        for (const [key, presences] of Object.entries(raw)) {
          // Take the most recent presence entry for each key
          flat[key] = presences[presences.length - 1] ?? presences[0]
        }
        setMembers(flat)
      })
      // ── Host-driven removal: when host broadcasts a 'kick' for our key,
      //    we unsubscribe and fire onKicked so the UI can return to the menu.
      .on('broadcast', { event: 'kick' }, (payload) => {
        if (!mountedRef.current) return
        const target = payload?.payload?.target
        if (target === SESSION_KEY) {
          channel.untrack().catch(() => {})
          supabase.removeChannel(channel).catch(() => {})
          channelRef.current = null
          setSyncStatus('offline')
          setMembers({})
          onKickedRef.current?.()
        }
      })
      .subscribe(async (status) => {
        if (!mountedRef.current) return
        if (status === 'SUBSCRIBED') {
          setSyncStatus('live')
          await channel.track({
            playerIdx,
            playerName,
            completedIds,
            xpEarned,
            totalTasks,
            joinedAt: Date.now(),
          })
        } else if (status === 'CLOSED') {
          setSyncStatus('offline')
          if (mountedRef.current) setMembers({})
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('error')
        }
      })

    return () => {
      mountedRef.current = false
      clearTimeout(timerRef.current)
      channel.untrack().catch(() => {})
      supabase.removeChannel(channel).catch(() => {})
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, enabled])

  // ── Re-track whenever own state changes (debounced 400 ms) ──────────────────
  useEffect(() => {
    if (syncStatus !== 'live' || !channelRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      channelRef.current?.track({
        playerIdx,
        playerName,
        completedIds,
        xpEarned,
        totalTasks,
        joinedAt: Date.now(),
      }).catch(() => {})
    }, 400)
    return () => clearTimeout(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedIds, xpEarned, playerName, syncStatus])

  // ── Derived: sorted member list ──────────────────────────────────────────────
  const memberList = useMemo(() =>
    Object.entries(members)
      .map(([key, state]) => ({ key, ...state }))
      .sort((a, b) => (a.playerIdx ?? 99) - (b.playerIdx ?? 99)),
    [members]
  )

  // ── Host action: broadcast a kick for a specific member key ────────────────
  const kickMember = (targetKey) => {
    if (!channelRef.current || !targetKey) return
    channelRef.current.send({
      type:    'broadcast',
      event:   'kick',
      payload: { target: targetKey },
    }).catch(() => {})
  }

  return { memberList, syncStatus, myKey: SESSION_KEY, kickMember }
}
