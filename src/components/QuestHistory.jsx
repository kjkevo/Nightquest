import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Scroll, Clock } from 'lucide-react'
import { RARITY_CONFIG } from '../data/quests'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function QuestHistory({ history, onClear }) {
  const [open, setOpen] = useState(false)

  const totalXP = history.reduce((s, h) => s + h.quest.xp, 0)

  return (
    <div className="border border-quest-border rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-quest-panel hover:bg-quest-panel/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Scroll size={14} className="text-quest-gold-dim" />
          <span className="font-display text-sm font-semibold text-gray-300 uppercase tracking-wider">Quest Log</span>
          {history.length > 0 && (
            <span className="bg-quest-gold/20 text-quest-gold border border-quest-gold-dim/40 text-[10px] font-display font-bold px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
          {history.length > 0 && (
            <span className="text-[10px] text-gray-600 font-body">+{totalXP.toLocaleString()} XP earned</span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>

      {/* List */}
      {open && (
        <div className="border-t border-quest-border">
          {history.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-display text-gray-600 text-xs uppercase tracking-wider">No quests completed yet</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end px-4 py-2 border-b border-quest-border/50">
                <button onClick={onClear}
                  className="flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-red-400 font-display uppercase tracking-wider transition-colors">
                  <Trash2 size={11} /> Clear Log
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-quest-border/40">
                {history.map((entry, i) => {
                  const r = RARITY_CONFIG[entry.quest.rarity]
                  const Icon = entry.quest.icon
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className={`shrink-0 w-8 h-8 rounded-md border flex items-center justify-center ${r.borderCls}`}
                        style={{ background: r.bg }}>
                        <Icon size={14} className={r.textCls} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-xs font-semibold text-gray-200 truncate">{entry.quest.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-display ${r.textCls}`}>{r.label}</span>
                          <span className="text-[10px] text-gray-600">·</span>
                          <span className="text-[10px] text-gray-500">{entry.quest.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-xs font-bold text-quest-gold">+{entry.quest.xp} XP</div>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <Clock size={9} className="text-gray-600" />
                          <span className="text-[10px] text-gray-600">{timeAgo(entry.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
