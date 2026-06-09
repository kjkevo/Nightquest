import { Sword, Users, Zap, AlertCircle } from 'lucide-react'

export default function ResumeTab({ activeGame, onResumeQuest, onResumeSquad }) {
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

        <button
          onClick={() => {
            if (activeGame.mode === 'quest') onResumeQuest()
            else onResumeSquad()
          }}
          className="w-full py-3 mt-4 rounded-xl font-display text-sm font-black uppercase tracking-widest text-quest-bg btn-press transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,rgb(var(--nq-gold-dim)),rgb(var(--nq-gold)))' }}>
          Resume Game →
        </button>
      </div>
    </div>
  )
}
