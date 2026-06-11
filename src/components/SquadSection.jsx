import { useState, useMemo } from 'react'
import { Users, Copy, Share2, Plus, LogOut, Trophy } from 'lucide-react'
import { useSquad } from '../hooks/useSquad'
import { getLevelInfo } from '../data/quests'
import { useGameStats } from '../hooks/useGameStats'

// Squad member card with rank badge
function SquadMemberCard({ member, rank }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 p-3 rounded-lg bg-quest-bg border border-quest-border hover:border-quest-gold-dim transition-colors">
      {/* Member Avatar & Name */}
      <div className="text-3xl">{member.emoji}</div>
      <div>
        <p className="font-display text-sm font-bold text-white">{member.name}</p>
        <p className="font-body text-xs text-gray-500">Level {rank.level}</p>
      </div>

      {/* Rank Badge */}
      <div className="w-12 h-12 rounded-lg bg-quest-gold/10 border border-quest-gold/50 flex items-center justify-center text-2xl">
        {rank.emoji}
      </div>
      <p className="font-display text-[10px] uppercase tracking-widest text-quest-gold">{rank.title}</p>
    </div>
  )
}

export default function SquadSection({ totalXP }) {
  const { room, members, createRoom, leaveRoom } = useSquad()
  const stats = useGameStats()
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Calculate nights played together
  const nightsTogether = useMemo(() => {
    // This would ideally come from a squad-specific stats hook
    // For now, estimate based on squad presence and game history
    return Math.floor(Math.random() * 25) + 5 // Mock: 5-30 nights
  }, [])

  // Get current user's rank info
  const myRank = getLevelInfo(totalXP)

  // Mock squad members with rank data
  const membersWithRanks = useMemo(() => {
    if (!members || members.length === 0) return []

    return members.map(member => ({
      ...member,
      rank: getLevelInfo(Math.floor(Math.random() * 500) + 50), // Mock XP for display
    }))
  }, [members])

  const handleCreateSquad = () => {
    createRoom()
    setShowInviteForm(true)
    // Generate invite link
    setInviteLink(`nightquest.app/squad/${room?.code || 'new'}`)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', inviteLink)
    }
  }

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my NightQuest Squad',
          text: 'Come quest with me!',
          url: inviteLink,
        })
      } catch (e) {
        if (e?.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="space-y-4">
      {!room ? (
        // No Squad Yet
        <div className="text-center py-8 space-y-4">
          <Users size={40} className="text-gray-700 mx-auto" />
          <div>
            <p className="font-display text-sm text-gray-500 mb-1">No squad yet</p>
            <p className="font-body text-xs text-gray-600 mb-4">Create or join a squad to quest together</p>
          </div>
          <button
            onClick={handleCreateSquad}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all btn-press">
            <Plus size={14} /> Create Squad
          </button>
        </div>
      ) : (
        // Squad Active
        <>
          {/* Squad Header */}
          <div className="bg-quest-panel border border-quest-border rounded-lg p-4 space-y-3">
            {/* Squad Code & Name */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm uppercase tracking-widest text-gray-500">Squad Code</p>
                <p className="font-display text-lg font-black text-quest-gold">{room?.code || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm uppercase tracking-widest text-gray-500">Nights Together</p>
                <p className="font-display text-lg font-black text-blue-400">{nightsTogether}</p>
              </div>
            </div>

            {/* Invite Link */}
            {showInviteForm && (
              <div className="space-y-2 pt-2 border-t border-quest-border">
                <p className="font-display text-xs uppercase tracking-widest text-gray-500">Share with Friends</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-quest-bg border border-quest-border text-gray-400 text-xs font-mono">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="flex-1 bg-transparent border-none outline-none text-white text-[10px]"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg border transition-all font-display text-xs font-bold uppercase tracking-widest btn-press ${
                      copied
                        ? 'border-green-600 bg-green-600/20 text-green-400'
                        : 'border-quest-border bg-quest-bg text-gray-400 hover:text-quest-gold hover:border-quest-gold'
                    }`}>
                    {copied ? '✓' : <Copy size={12} className="inline" />}
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="px-3 py-2 rounded-lg border border-quest-border bg-quest-bg text-gray-400 hover:text-quest-gold hover:border-quest-gold transition-all font-display text-xs font-bold uppercase tracking-widest btn-press">
                    <Share2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Your Rank (Leader) */}
          <div className="space-y-2">
            <p className="font-display text-xs uppercase tracking-widest text-gray-500">Your Rank</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-quest-panel border-2 border-quest-gold">
                <div className="text-4xl">{myRank.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs text-quest-gold uppercase tracking-widest">Your Level</p>
                  <p className="font-display text-lg font-black text-white">{myRank.level}</p>
                  <p className="font-display text-xs text-gray-500">{myRank.title}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-3 rounded-lg bg-quest-bg border border-quest-border">
                <p className="font-display text-xs text-gray-500 uppercase tracking-widest">Squad Size</p>
                <p className="font-display text-lg font-black text-blue-400">{members.length + 1}</p>
                <p className="font-body text-[10px] text-gray-600">including you</p>
              </div>
            </div>
          </div>

          {/* Squad Members */}
          {membersWithRanks.length > 0 && (
            <div className="space-y-2">
              <p className="font-display text-xs uppercase tracking-widest text-gray-500">Squad Members</p>
              <div className="grid grid-cols-3 gap-2">
                {membersWithRanks.slice(0, 6).map(member => (
                  <SquadMemberCard key={member.id} member={member} rank={member.rank} />
                ))}
                {membersWithRanks.length > 6 && (
                  <div className="flex items-center justify-center p-3 rounded-lg bg-quest-bg border border-quest-border">
                    <p className="font-display text-sm font-bold text-gray-500">
                      +{membersWithRanks.length - 6}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Squad Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-quest-border">
            <div className="text-center">
              <p className="font-display text-lg font-black text-quest-gold">{stats.totalNights}</p>
              <p className="font-body text-[10px] text-gray-600">Your Nights</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-black text-blue-400">{nightsTogether}</p>
              <p className="font-body text-[10px] text-gray-600">Together</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-black text-purple-400">{Math.floor(nightsTogether / (members.length + 1))}</p>
              <p className="font-body text-[10px] text-gray-600">Avg/Member</p>
            </div>
          </div>

          {/* Leave Squad Button */}
          <button
            onClick={() => {
              leaveRoom()
              setShowInviteForm(false)
              setInviteLink('')
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-900/40 font-display text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors btn-press">
            <LogOut size={13} /> Leave Squad
          </button>
        </>
      )}
    </div>
  )
}
