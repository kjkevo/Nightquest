import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, X } from 'lucide-react'

/**
 * NightTimerBar
 *
 * Compact collapsible strip showing:
 *  • elapsed time (counting up)
 *  • phase progress dots
 *  • current phase name + tip (when expanded)
 *  • "End Night" reset button (when expanded)
 *
 * Props: { formatted, phase, phaseIndex, elapsedMinutes, PHASES, onEndNight }
 */
export default function NightTimerBar({ formatted, phase, phaseIndex, elapsedMinutes, PHASES, onEndNight }) {
  const [expanded, setExpanded] = useState(false)

  if (!formatted) return null

  // Progress along phase: how far into the current phase's range?
  const nextPhase        = PHASES[phaseIndex + 1]
  const phaseStart       = phase.minMinutes
  const phaseEnd         = nextPhase?.minMinutes ?? phaseStart + 45
  const inPhaseMinutes   = elapsedMinutes - phaseStart
  const inPhasePct       = Math.min(inPhaseMinutes / (phaseEnd - phaseStart), 1)

  return (
    <div className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{ borderColor: `${phase.color}30`, background: `${phase.color}08` }}>

      {/* ── Compact header row ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Clock + elapsed */}
        <Clock size={12} style={{ color: phase.color }} className="shrink-0" />
        <span className="font-display text-xs font-black tabular-nums" style={{ color: phase.color }}>
          {formatted}
        </span>

        {/* Divider */}
        <div className="w-px h-3 bg-gray-700 shrink-0" />

        {/* Phase dots */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {PHASES.map((p, i) => (
            <div key={p.id}
              className="rounded-full shrink-0 transition-all duration-500"
              style={{
                width:  i === phaseIndex ? '8px' : '5px',
                height: i === phaseIndex ? '8px' : '5px',
                background: i < phaseIndex
                  ? p.color            // past phases: full colour
                  : i === phaseIndex
                    ? p.color          // current: full colour + bigger
                    : '#2d2d3d',       // future: dim
                boxShadow: i === phaseIndex ? `0 0 6px ${p.color}` : 'none',
              }} />
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 transition-colors"
          aria-label={expanded ? 'Collapse night timer' : 'Expand night timer'}
          style={{ color: phase.color }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* ── Expanded panel ──────────────────────────────────────────────────── */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 animate-fade-in">
          {/* Divider */}
          <div className="h-px" style={{ background: `${phase.color}20` }} />

          {/* Phase tip */}
          <p className="font-body text-xs text-gray-400 italic leading-relaxed">
            {phase.tip}
          </p>

          {/* Phase progress within current phase */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-display text-[9px] uppercase tracking-wider" style={{ color: phase.color }}>
                {phase.label}
              </span>
              {nextPhase && (
                <span className="font-display text-[9px] uppercase tracking-wider text-gray-600">
                  → {nextPhase.label} in {nextPhase.minMinutes - elapsedMinutes}m
                </span>
              )}
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${inPhasePct * 100}%`,
                  background: `linear-gradient(90deg, ${phase.color}88, ${phase.color})`,
                }} />
            </div>
          </div>

          {/* Full phase timeline */}
          <div className="grid grid-cols-4 gap-1">
            {PHASES.map((p, i) => (
              <div key={p.id} className="text-center">
                <div className="h-0.5 rounded-full mb-1 transition-all duration-500"
                  style={{ background: i <= phaseIndex ? p.color : '#2d2d3d' }} />
                <p className="font-display text-[8px] uppercase leading-tight"
                  style={{ color: i === phaseIndex ? p.color : '#4b5563' }}>
                  {p.label}
                </p>
                <p className="font-display text-[7px] text-gray-700">
                  {p.minMinutes}m+
                </p>
              </div>
            ))}
          </div>

          {/* End Night */}
          <button onClick={onEndNight}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-800 font-display text-[9px] uppercase tracking-widest text-gray-600 hover:text-red-400 hover:border-red-900/50 transition-all">
            <X size={9} /> End Night · Reset Timer
          </button>
        </div>
      )}
    </div>
  )
}
