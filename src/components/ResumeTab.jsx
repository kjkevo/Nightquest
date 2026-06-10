import { useState } from 'react'
import { Sword, Users, Zap, AlertCircle, CheckCircle, Circle, X } from 'lucide-react'

export default function ResumeTab({ activeGame, onResumeQuest, onResumeSquad, onQuitQuest, onQuitSquad, onTaskToggle }) {
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const handleQuitConfirm = () => {
    setShowQuitConfirm(false)
    if (activeGame?.mode === 'quest' && onQuitQuest) {
      onQuitQuest()
    } else if (activeGame?.mode === 'squad' && onQuitSquad) {
      onQuitSquad()
    }
  }

  const handleTaskClick = (task) => {
    if (onTaskToggle) {
      onTaskToggle(task.id)
    }
  }

  if (!activeGame) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="text-center py-16">
          <AlertCircle size={40} className="text-gray-700 mx-auto mb-4" />
          <h2 className="font-display text-xl font-black text-gray-400 mb-2">No Active Game</h2>
          <p className="font-body text-sm text-gray-600 mb-6">Select a mode to start the night</p>

          <div className="space-y-3">
            <p className="font-display text-xs uppercase tracking-widest text-gray-700 mb-4">Available modes:</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-quest-panel border border-quest-border">
                <Sword size={16} className="text-quest-gold shrink-0" />
                <div>
                  <p className="font-display text-xs font-bold text-gray-300">Quest</p>
                  <p className="font-body text-[10px] text-gray-600">Solo missions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-quest-panel border border-quest-border">
                <Users size={16} className="text-quest-gold shrink-0" />
                <div>
                  <p className="font-display text-xs font-bold text-gray-300">Squad</p>
                  <p className="font-body text-[10px] text-gray-600">Multiplayer or VS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active game view
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Game Header */}
      <div className="rounded-2xl border-2 border-quest-gold/30 bg-quest-panel p-6" style={{ boxShadow: '0 0 20px rgba(240,192,96,0.08)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-quest-gold/10 border border-quest-gold/30 flex items-center justify-center">
            {activeGame.mode === 'quest' ? <Sword size={18} className="text-quest-gold" /> : <Users size={18} className="text-quest-gold" />}
          </div>
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-quest-gold">Active Game</p>
            <p className="font-display text-base font-bold text-white">{activeGame.mode === 'quest' ? 'Quest' : 'Squad'} Mode</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="bg-quest-bg rounded-lg p-3">
              <p className="font-display text-xl font-black text-quest-gold">{activeGame.outing?.emoji}</p>
              <p className="font-display text-xs font-bold text-gray-300 mt-1">{activeGame.outing?.label}</p>
            </div>
            <div className="bg-quest-bg rounded-lg p-3">
              <p className="font-display text-xl font-bold" style={{ color: activeGame.difficulty?.color }}>
                {activeGame.difficulty?.label}
              </p>
              <p className="font-display text-[9px] text-gray-600 mt-1">Difficulty</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-quest-bg">
            <Zap size={14} className="text-quest-gold" />
            <span className="font-display text-sm font-bold text-quest-gold">{activeGame.sessionXP || 0}</span>
            <span className="font-body text-xs text-gray-600">XP earned</span>
            <span className="ml-auto font-display text-xs text-gray-600">{activeGame.completed || 0} / {activeGame.total || 0} missions</span>
          </div>
        </div>
      </div>

      {/* Missions List */}
      {activeGame.tasks && activeGame.tasks.length > 0 && (
        <div className="space-y-2">
          <p className="font-display text-xs uppercase tracking-widest text-gray-600 px-1">Missions (click to mark complete)</p>
          {activeGame.tasks.map((task) => {
            const isCompleted = activeGame.completedIds?.includes(task.id)
            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="w-full flex items-start gap-3 p-3 rounded-lg bg-quest-panel border border-quest-border hover:border-quest-gold-dim transition-colors cursor-pointer text-left">
                <div className="mt-1 shrink-0">
                  {isCompleted ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <Circle size={16} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-display text-xs font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                    {task.title}
                  </p>
                  <p className="font-body text-[10px] text-gray-600 mt-1 line-clamp-2">
                    {task.desc || task.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-xs font-bold text-quest-gold">+{task.xp}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Quit Game Button */}
      {(onQuitQuest || onQuitSquad) && (
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="w-full py-2.5 rounded-lg border border-red-900/40 font-display text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-all btn-press">
          Quit Game
        </button>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-quest-panel border border-quest-border rounded-2xl p-6 max-w-sm w-full space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-900/20 border border-red-800/30 flex items-center justify-center">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <h2 className="font-display text-lg font-black text-white">Are You Sure?</h2>
            </div>

            {/* Message */}
            <p className="font-body text-sm text-gray-400">
              Quitting will abandon your current game. All progress will be lost.
            </p>

            {/* Game Info */}
            <div className="p-3 rounded-lg bg-quest-bg border border-quest-border">
              <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 mb-2">Current Game</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeGame.outing?.emoji}</span>
                  <div>
                    <p className="font-display text-xs font-bold text-white">{activeGame.outing?.label}</p>
                    <p className="font-display text-[9px] text-gray-600">{activeGame.difficulty?.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-quest-gold">{activeGame.sessionXP || 0} XP</p>
                  <p className="font-display text-[9px] text-gray-600">{activeGame.completed || 0}/{activeGame.total || 0}</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="py-2.5 rounded-xl border border-quest-border font-display text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-300 transition-all btn-press">
                <X size={12} className="inline mr-1" /> Cancel
              </button>
              <button
                onClick={handleQuitConfirm}
                className="py-2.5 rounded-xl border border-red-900/40 font-display text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-all btn-press bg-red-900/10">
                Quit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
