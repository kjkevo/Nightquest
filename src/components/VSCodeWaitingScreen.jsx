import { useState, useEffect } from 'react'
import { Copy, Share2, CheckCircle, Users } from 'lucide-react'

export default function VSCodeWaitingScreen({ code, teamName, onTeamJoined, onBack }) {
  const [copied, setCopied] = useState(false)
  const [team2Joined, setTeam2Joined] = useState(false)

  // Simulate checking for team 2 join
  useEffect(() => {
    // In a real app, this would check if team 2 has joined via the code
    // For now, we'll simulate it with a button click in the UI
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(code)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${teamName}'s VS team`,
          text: `Room code: ${code}`,
        })
      } catch (e) {
        if (e?.name !== 'AbortError') {
          handleCopy()
        }
      }
    } else {
      handleCopy()
    }
  }

  // If team 2 has joined, show confirmation
  if (team2Joined) {
    return (
      <div className="space-y-4 pb-4">
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle size={32} className="text-green-400 animate-bounce" />
          </div>
          <h2 className="font-display text-2xl font-black text-white">Team Joined! ✓</h2>
          <p className="font-body text-gray-400">
            Team 2 has joined the VS match with code <span className="font-bold text-quest-gold">{code}</span>
          </p>

          <div className="bg-quest-panel border border-quest-border rounded-lg p-4 mt-6">
            <p className="font-display text-xs uppercase tracking-widest text-gray-500 mb-3">Teams Ready</p>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="font-display text-lg font-bold text-white">{teamName}</p>
                <p className="font-body text-xs text-gray-600 mt-1">Team 1 Ready</p>
              </div>
              <div className="text-2xl">⚔️</div>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-purple-300">Team 2</p>
                <p className="font-body text-xs text-gray-600 mt-1">Ready</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onTeamJoined()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all btn-press mt-6">
            Continue to Event Selection
          </button>
        </div>
      </div>
    )
  }

  // Waiting for team 2
  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="text-center py-4">
        <p className="font-display text-base font-bold text-white">{teamName}</p>
        <p className="font-body text-sm text-gray-500 mt-1">Share your code to get started</p>
      </div>

      {/* Code Display */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-2 border-purple-600/50 rounded-2xl p-6 space-y-4">
        <p className="text-center font-display text-[10px] uppercase tracking-widest text-gray-500">
          Share this code
        </p>
        <p className="text-center font-display text-6xl font-black tracking-[0.35em] text-quest-gold select-all">
          {code}
        </p>
        <p className="text-center font-body text-xs text-gray-400">
          Team 2 enters this code to join
        </p>
      </div>

      {/* Share Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-xs font-bold uppercase tracking-widest transition-all btn-press ${
            copied
              ? 'bg-green-600/20 border border-green-600 text-green-400'
              : 'bg-quest-bg border border-quest-border text-gray-400 hover:text-quest-gold'
          }`}>
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-quest-bg border border-quest-border text-gray-400 hover:text-quest-gold font-display text-xs font-bold uppercase tracking-widest transition-all btn-press">
          <Share2 size={16} />
          Share
        </button>
      </div>

      {/* Waiting Indicator */}
      <div className="bg-quest-panel border border-quest-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 justify-center">
          <Users size={18} className="text-purple-400 animate-pulse" />
          <p className="font-display text-sm font-bold text-white">Waiting for Team 2...</p>
        </div>
        <p className="font-body text-xs text-gray-500 text-center">
          Send them the code above. Once they join, you'll both pick your event & difficulty together.
        </p>
      </div>

      {/* Simulate Team Join Button (for testing) */}
      <button
        onClick={() => setTeam2Joined(true)}
        className="w-full py-2 rounded-lg border border-dashed border-gray-600 text-gray-600 font-display text-xs font-bold uppercase tracking-widest hover:border-gray-500 hover:text-gray-500 transition-colors">
        [TEST] Simulate Team 2 Joining
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full py-2 rounded-lg border border-red-900/40 text-red-400 hover:text-red-300 font-display text-xs font-bold uppercase tracking-widest transition-colors">
        Back
      </button>
    </div>
  )
}
