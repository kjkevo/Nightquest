import { Clock, X } from 'lucide-react'

export default function TimerSetupModal({ onEnable, onDisable }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-quest-panel border border-quest-border rounded-2xl p-6 max-w-sm w-full space-y-6 animate-fade-in">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Clock size={32} className="text-quest-gold" />
          </div>
          <h2 className="font-display text-xl font-black text-white">Track Your Time?</h2>
          <p className="font-body text-sm text-gray-400">Start a stopwatch to see how long you take to complete these missions</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={onEnable}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest text-quest-bg transition-all btn-press"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--nq-gold-dim)), rgb(var(--nq-gold)))',
              boxShadow: '0 0 20px rgba(240,192,96,0.3)',
            }}>
            <Clock size={14} />
            Start Timer
          </button>

          <button
            onClick={onDisable}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm font-bold uppercase tracking-widest border border-quest-border text-gray-400 hover:text-gray-300 transition-all btn-press">
            <X size={14} />
            Skip Timer
          </button>
        </div>

        {/* Info */}
        <p className="text-center font-body text-[10px] text-gray-600">
          You can change this anytime during your missions
        </p>
      </div>
    </div>
  )
}
