import { useState } from 'react'
import { STATUSES } from '../hooks/useSquad'

// ─── Venue map positions (% of SVG viewport 0-100) ───────────────────────────
export const VENUE_MAP_POS = {
  1:  { x: 43, y: 37 }, // Rusty Anchor - Downtown
  2:  { x: 37, y: 17 }, // Library Bar - Campus
  3:  { x: 24, y: 60 }, // Pioneer Tap - Arts
  4:  { x: 30, y: 44 }, // Speakeasy - Historic
  5:  { x: 56, y: 48 }, // Bourbon & Blues - Midtown
  6:  { x: 70, y: 36 }, // Club Eclipse - Entertainment
  7:  { x: 52, y: 57 }, // Velvet Underground - Midtown
  8:  { x: 77, y: 45 }, // Neon Garden - Entertainment
  9:  { x: 47, y: 41 }, // After Hours - Downtown
  10: { x: 76, y: 65 }, // Warehouse Social
  11: { x: 61, y: 53 }, // Noir Lounge - Midtown
  12: { x: 39, y: 32 }, // Skyline Rooftop - Downtown
  13: { x: 50, y: 30 }, // Penthouse - Downtown
  14: { x: 83, y: 70 }, // Hops & Dreams - Warehouse
  15: { x: 44, y: 10 }, // Campus Cantina
  16: { x: 38, y: 14 }, // Greek Row Tavern
  17: { x: 53, y: 38 }, // Midnight Kitchen - Downtown
  18: { x: 50, y: 12 }, // Grillhouse - Campus
  19: { x: 73, y: 52 }, // Breakfast Club - Entertainment
  20: { x: 42, y: 8  }, // Slice & Dice - Campus
}

const VENUE_TYPE_COLORS = {
  Bar:       '#3b82f6',
  Club:      '#8b5cf6',
  Lounge:    '#ec4899',
  Rooftop:   '#06b6d4',
  Brewery:   '#f97316',
  'Late Food': '#22c55e',
}

// Simplified street grid for the map
const STREETS = {
  // Major horizontal
  majorH: [8, 22, 37, 54, 68, 80],
  // Major vertical
  majorV: [15, 32, 50, 66, 80],
  // Minor horizontal
  minorH: [14, 29, 45, 61, 74],
  // Minor vertical
  minorV: [22, 41, 58, 73],
}

// District backgrounds
const DISTRICTS = [
  { x: 0, y: 0,  w: 60, h: 27, label: 'Campus District',       fill: 'rgba(59,130,246,0.04)'  },
  { x: 20, y: 27, w: 60, h: 40, label: 'Downtown',              fill: 'rgba(240,192,96,0.03)'  },
  { x: 55, y: 27, w: 45, h: 42, label: 'Entertainment District',fill: 'rgba(124,58,237,0.05)'  },
  { x: 0, y: 50,  w: 40, h: 50, label: 'Arts District',         fill: 'rgba(34,197,94,0.03)'   },
  { x: 55, y: 60, w: 45, h: 40, label: 'Warehouse District',    fill: 'rgba(249,115,22,0.04)'  },
  { x: 40, y: 43, w: 25, h: 22, label: 'Midtown',               fill: 'rgba(236,72,153,0.03)'  },
]

export default function SquadMap({ members, myMapPos, meetupPins, venues, onPinAdd }) {
  const [tooltip, setTooltip] = useState(null) // { text, x, y }
  const [addingPin, setAddingPin] = useState(false)
  const [newPinPos, setNewPinPos] = useState(null)
  const [pinName, setPinName] = useState('')

  const W = 400, H = 360

  const pct = (val, max) => (val / 100) * max

  const handleMapClick = (e) => {
    if (!addingPin) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setNewPinPos({ x, y })
  }

  const confirmPin = () => {
    if (!pinName.trim() || !newPinPos) return
    onPinAdd({ name: pinName.trim(), x: newPinPos.x, y: newPinPos.y })
    setPinName(''); setNewPinPos(null); setAddingPin(false)
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-quest-border"
        style={{ background: '#070710' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ cursor: addingPin ? 'crosshair' : 'default' }}
          onClick={handleMapClick}
        >
          {/* District fills */}
          {DISTRICTS.map((d, i) => (
            <rect key={i}
              x={pct(d.x, W)} y={pct(d.y, H)}
              width={pct(d.w, W)} height={pct(d.h, H)}
              fill={d.fill} />
          ))}

          {/* Minor streets */}
          {STREETS.minorH.map(y => (
            <line key={`mh${y}`} x1={0} y1={pct(y, H)} x2={W} y2={pct(y, H)}
              stroke="#0f0f1a" strokeWidth={1} />
          ))}
          {STREETS.minorV.map(x => (
            <line key={`mv${x}`} x1={pct(x, W)} y1={0} x2={pct(x, W)} y2={H}
              stroke="#0f0f1a" strokeWidth={1} />
          ))}

          {/* Major streets */}
          {STREETS.majorH.map(y => (
            <line key={`Mh${y}`} x1={0} y1={pct(y, H)} x2={W} y2={pct(y, H)}
              stroke="#161628" strokeWidth={2.5} />
          ))}
          {STREETS.majorV.map(x => (
            <line key={`Mv${x}`} x1={pct(x, W)} y1={0} x2={pct(x, W)} y2={H}
              stroke="#161628" strokeWidth={2.5} />
          ))}

          {/* District labels */}
          {DISTRICTS.map((d, i) => (
            <text key={i}
              x={pct(d.x + d.w / 2, W)}
              y={pct(d.y + 4, H)}
              textAnchor="middle"
              fontSize={6}
              fill="rgba(255,255,255,0.08)"
              fontFamily="serif"
              letterSpacing={1}>
              {d.label.toUpperCase()}
            </text>
          ))}

          {/* Venue dots */}
          {venues.map(v => {
            const pos = VENUE_MAP_POS[v.id]
            if (!pos) return null
            const color = VENUE_TYPE_COLORS[v.type] || '#6b7280'
            return (
              <g key={v.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ text: v.name, x: pct(pos.x, W), y: pct(pos.y, H) })}
                onMouseLeave={() => setTooltip(null)}>
                <circle cx={pct(pos.x, W)} cy={pct(pos.y, H)} r={5}
                  fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1} />
                <circle cx={pct(pos.x, W)} cy={pct(pos.y, H)} r={2.5}
                  fill={color} />
              </g>
            )
          })}

          {/* Meetup pins */}
          {meetupPins.map(pin => (
            <g key={pin.id}
              onMouseEnter={() => setTooltip({ text: `📍 ${pin.name}`, x: pct(pin.x, W), y: pct(pin.y, H) })}
              onMouseLeave={() => setTooltip(null)}>
              {/* Pin glow */}
              <circle cx={pct(pin.x, W)} cy={pct(pin.y, H)} r={10}
                fill="#f0c060" fillOpacity={0.12} />
              {/* Star shape */}
              <polygon
                points={(() => {
                  const cx = pct(pin.x, W), cy = pct(pin.y, H)
                  const outer = 6, inner = 3
                  return Array.from({ length: 10 }).map((_, i) => {
                    const r = i % 2 === 0 ? outer : inner
                    const angle = (i * 36 - 90) * Math.PI / 180
                    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
                  }).join(' ')
                })()}
                fill="#f0c060" stroke="#a07830" strokeWidth={0.5} />
              <text x={pct(pin.x, W)} y={pct(pin.y, H) + 13}
                textAnchor="middle" fontSize={5.5} fill="#f0c060" fontFamily="serif"
                letterSpacing={0.3}>
                {pin.name.slice(0, 12)}
              </text>
            </g>
          ))}

          {/* Pending pin placement */}
          {newPinPos && (
            <g>
              <circle cx={pct(newPinPos.x, W)} cy={pct(newPinPos.y, H)} r={8}
                fill="#f0c060" fillOpacity={0.3} stroke="#f0c060" strokeWidth={1} strokeDasharray="2 2" />
              <text x={pct(newPinPos.x, W)} y={pct(newPinPos.y, H) + 4}
                textAnchor="middle" fontSize={8} fill="#f0c060">📍</text>
            </g>
          )}

          {/* Squad member dots */}
          {members.map(m => {
            const s = STATUSES[m.status] || STATUSES.home
            return (
              <g key={m.id}
                onMouseEnter={() => setTooltip({ text: `${m.emoji} ${m.name}: ${s.label}`, x: pct(m.mapX, W), y: pct(m.mapY, H) })}
                onMouseLeave={() => setTooltip(null)}>
                {/* Pulse ring */}
                <circle cx={pct(m.mapX, W)} cy={pct(m.mapY, H)} r={11}
                  fill="none" stroke={m.color} strokeWidth={1} strokeOpacity={0.3}>
                  <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Member dot */}
                <circle cx={pct(m.mapX, W)} cy={pct(m.mapY, H)} r={7}
                  fill={m.color} fillOpacity={0.9} stroke="#0a0a0f" strokeWidth={1.5} />
                <text x={pct(m.mapX, W)} y={pct(m.mapY, H) + 3.5}
                  textAnchor="middle" fontSize={8} dominantBaseline="middle">
                  {m.emoji}
                </text>
              </g>
            )
          })}

          {/* My position (gold star) */}
          <g onMouseEnter={() => setTooltip({ text: '⭐ You', x: pct(myMapPos.x, W), y: pct(myMapPos.y, H) })}
            onMouseLeave={() => setTooltip(null)}>
            <circle cx={pct(myMapPos.x, W)} cy={pct(myMapPos.y, H)} r={13}
              fill="none" stroke="#f0c060" strokeWidth={1.5} strokeOpacity={0.4}>
              <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={pct(myMapPos.x, W)} cy={pct(myMapPos.y, H)} r={8}
              fill="#f0c060" stroke="#0a0a0f" strokeWidth={1.5} />
            <text x={pct(myMapPos.x, W)} y={pct(myMapPos.y, H) + 3.5}
              textAnchor="middle" fontSize={9} dominantBaseline="middle">⭐</text>
          </g>

          {/* Tooltip */}
          {tooltip && (() => {
            const tx = Math.min(tooltip.x, W - 70)
            const ty = tooltip.y > H / 2 ? tooltip.y - 22 : tooltip.y + 14
            return (
              <g>
                <rect x={tx - 4} y={ty - 10} width={80} height={14} rx={3}
                  fill="#12121e" stroke="#2a1a4a" strokeWidth={0.8} />
                <text x={tx + 36} y={ty} textAnchor="middle" fontSize={6.5} fill="#e8e0d0" fontFamily="serif">
                  {tooltip.text}
                </text>
              </g>
            )
          })()}

          {/* Compass */}
          <g transform={`translate(${W - 22}, 18)`}>
            <circle r={10} fill="#0a0a0f" stroke="#1e1e35" strokeWidth={1} />
            <text textAnchor="middle" y={-4} fontSize={5} fill="#f0c060" fontWeight="bold">N</text>
            <text textAnchor="middle" y={7}  fontSize={4} fill="#4b5563">S</text>
            <text x={-6} y={2.5} fontSize={4} fill="#4b5563">W</text>
            <text x={2}  y={2.5} fontSize={4} fill="#4b5563">E</text>
            <line x1={0} y1={-6} x2={0} y2={6} stroke="#f0c060" strokeWidth={0.8} />
            <line x1={-6} y1={0} x2={6} y2={0} stroke="#4b5563" strokeWidth={0.8} />
          </g>

          {/* Legend */}
          <g transform={`translate(6, ${H - 28})`}>
            <rect width={72} height={26} rx={3} fill="#0a0a0f" fillOpacity={0.85} stroke="#1e1e35" strokeWidth={0.8} />
            {[['#3b82f6','Bar'], ['#8b5cf6','Club'], ['#06b6d4','Rooftop'], ['#22c55e','Food']].map(([color, label], i) => (
              <g key={label} transform={`translate(${(i % 2) * 35 + 5}, ${Math.floor(i / 2) * 11 + 7})`}>
                <circle r={3} fill={color} fillOpacity={0.8} />
                <text x={6} y={3.5} fontSize={5} fill="#6b7280" fontFamily="serif">{label}</text>
              </g>
            ))}
          </g>
        </svg>

        {/* Add pin overlay label */}
        {addingPin && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-quest-gold/90 text-quest-bg font-display text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
            Tap the map to place your pin
          </div>
        )}
      </div>

      {/* Pin name input (shows after tapping) */}
      {newPinPos && (
        <div className="flex gap-2 animate-fade-in">
          <input value={pinName} onChange={e => setPinName(e.target.value)}
            placeholder="Pin name (e.g. 'Back entrance')"
            onKeyDown={e => e.key === 'Enter' && confirmPin()}
            className="flex-1 bg-quest-panel border border-quest-gold-dim/60 rounded-lg px-3 py-2 font-body text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-quest-gold" />
          <button onClick={confirmPin}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-xs font-bold uppercase tracking-wider btn-press">
            Save
          </button>
          <button onClick={() => { setNewPinPos(null); setAddingPin(false); setPinName('') }}
            className="px-3 py-2 rounded-lg border border-quest-border text-gray-500 font-display text-xs uppercase btn-press">
            ✕
          </button>
        </div>
      )}

      {/* Map controls */}
      <div className="flex gap-2">
        <button onClick={() => { setAddingPin(a => !a); setNewPinPos(null); setPinName('') }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-display text-[10px] uppercase tracking-wider transition-all btn-press
            ${addingPin
              ? 'bg-quest-gold/20 border-quest-gold text-quest-gold'
              : 'border-quest-border text-gray-500 hover:text-quest-gold hover:border-quest-gold-dim'}`}>
          📍 {addingPin ? 'Cancel Pin' : 'Drop Pin'}
        </button>
        <div className="flex-1 flex items-center justify-end gap-1.5">
          {[['#f0c060','You'], ['#7c3aed','Squad'], ['#f0c060','Meetup']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1 text-[9px] text-gray-600 font-display uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
