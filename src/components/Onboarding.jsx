import { useState, useRef } from 'react'
import { Moon, ChevronRight, Check, X, Users, MapPin, GraduationCap, Plus, Trash2 } from 'lucide-react'
import { NEIGHBORHOODS, POPULAR_UNIVERSITIES } from '../hooks/useOnboarding'

const TOTAL_STEPS = 3

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300
          ${i < step ? 'bg-quest-gold' : i === step ? 'bg-quest-gold/50 animate-pulse' : 'bg-gray-800'}`} />
      ))}
    </div>
  )
}

// ── Step 1: University ────────────────────────────────────────────────────────
function StepUniversity({ value, onChange, onNext, onSkip }) {
  const [query, setQuery] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const filtered = POPULAR_UNIVERSITIES.filter(u =>
    u.toLowerCase().includes(query.toLowerCase()) && query.length > 0
  )

  const commit = (v) => { onChange(v); setQuery(v); setShowSuggestions(false) }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-900/30 border border-blue-700/40 flex items-center justify-center">
          <GraduationCap size={24} className="text-blue-400" />
        </div>
        <h2 className="font-display text-xl font-black text-gray-100">Your University</h2>
        <p className="font-body text-sm text-gray-500">We'll personalize venue suggestions for your campus area.</p>
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Type your university name…"
          className="w-full bg-quest-panel border border-quest-border rounded-xl px-4 py-3.5 font-body text-base text-gray-100 placeholder-gray-700 outline-none focus:border-quest-gold-dim transition-colors"
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
            <X size={14} />
          </button>
        )}
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-quest-panel border border-quest-border rounded-xl overflow-hidden z-10 animate-fade-in">
            {filtered.slice(0, 5).map(u => (
              <button key={u} onMouseDown={() => commit(u)}
                className="w-full text-left px-4 py-2.5 font-body text-sm text-gray-300 hover:bg-quest-border/30 transition-colors">
                {u}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onSkip}
          className="py-3 px-4 rounded-xl border border-quest-border text-gray-600 font-display text-[10px] uppercase tracking-widest hover:text-gray-400 transition-colors">
          Skip
        </button>
        <button onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-sm font-bold uppercase tracking-widest btn-press">
          Continue <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Area ──────────────────────────────────────────────────────────────
function StepArea({ value, onChange, onNext, onBack, onSkip }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-green-900/30 border border-green-700/40 flex items-center justify-center">
          <MapPin size={24} className="text-green-400" />
        </div>
        <h2 className="font-display text-xl font-black text-gray-100">Your Area</h2>
        <p className="font-body text-sm text-gray-500">Where do you usually go out?</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {NEIGHBORHOODS.map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`px-4 py-2.5 rounded-xl border font-display text-xs uppercase tracking-wider font-semibold transition-all btn-press
              ${value === n
                ? 'bg-green-900/50 border-green-600 text-green-300'
                : 'bg-quest-panel border-quest-border text-gray-400 hover:border-gray-500'}`}>
            {value === n && <Check size={10} className="inline mr-1" />}
            {n}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack}
          className="py-3 px-4 rounded-xl border border-quest-border text-gray-600 font-display text-[10px] uppercase tracking-widest hover:text-gray-400 transition-colors">
          Back
        </button>
        <button onClick={onSkip}
          className="py-3 px-4 rounded-xl border border-quest-border text-gray-600 font-display text-[10px] uppercase tracking-widest hover:text-gray-400 transition-colors">
          Skip
        </button>
        <button onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg font-display text-sm font-bold uppercase tracking-widest btn-press">
          Continue <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Squad ─────────────────────────────────────────────────────────────
function StepSquad({ squad, setSquad, onFinish, onBack }) {
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  const addMember = () => {
    const name = inputVal.trim()
    if (!name || squad.length >= 6) return
    setSquad(prev => [...prev, name])
    setInputVal('')
    inputRef.current?.focus()
  }

  const removeMember = (i) => setSquad(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900/30 border border-purple-700/40 flex items-center justify-center">
          <Users size={24} className="text-purple-400" />
        </div>
        <h2 className="font-display text-xl font-black text-gray-100">Your Squad</h2>
        <p className="font-body text-sm text-gray-500">
          Add who you usually go out with. You can always change this later.
        </p>
      </div>

      {/* Member chips */}
      {squad.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {squad.map((name, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 font-display text-xs">
              {name}
              <button onClick={() => removeMember(i)} className="text-purple-500 hover:text-purple-300">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add input */}
      {squad.length < 6 && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
            placeholder="Squad member name…"
            className="flex-1 bg-quest-panel border border-quest-border rounded-xl px-4 py-3 font-body text-base text-gray-100 placeholder-gray-700 outline-none focus:border-purple-700/60 transition-colors"
          />
          <button onClick={addMember} disabled={!inputVal.trim()}
            className="w-12 flex items-center justify-center rounded-xl bg-purple-900/40 border border-purple-700/40 text-purple-300 hover:bg-purple-900/60 disabled:opacity-30 transition-all btn-press">
            <Plus size={16} />
          </button>
        </div>
      )}
      {squad.length >= 6 && (
        <p className="text-[11px] text-gray-700 font-body text-center">Max 6 squad members</p>
      )}

      <div className="flex gap-2">
        <button onClick={onBack}
          className="py-3 px-4 rounded-xl border border-quest-border text-gray-600 font-display text-[10px] uppercase tracking-widest hover:text-gray-400 transition-colors">
          Back
        </button>
        <button onClick={onFinish}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-quest-gold text-white font-display text-sm font-bold uppercase tracking-widest btn-press"
          style={{ boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
          <Moon size={14} /> Let's Go
        </button>
      </div>
    </div>
  )
}

// ── Done animation ─────────────────────────────────────────────────────────────
function StepDone({ university, area }) {
  return (
    <div className="animate-fade-in text-center space-y-4 py-4">
      <div className="relative mx-auto w-20 h-20">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900 to-quest-bg border-2 border-purple-600/60 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
          <Moon size={32} className="text-purple-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-quest-gold flex items-center justify-center">
          <Check size={14} className="text-quest-bg" strokeWidth={3} />
        </div>
      </div>
      <div>
        <h2 className="font-display text-2xl font-black text-shimmer">You're set!</h2>
        {(university || area) && (
          <p className="font-body text-sm text-gray-400 mt-1">
            {[university, area].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <div className="space-y-2 text-left bg-quest-panel border border-quest-border rounded-xl p-4">
        {[
          { icon: '🔒', text: 'No account needed — your data stays on this device' },
          { icon: '📶', text: 'Works offline — plan and squad contacts always available' },
          { icon: '🎮', text: 'Earn XP, complete quests, and build your night legend' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">{icon}</span>
            <p className="font-body text-sm text-gray-400">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Onboarding ───────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [step, setStep]           = useState(0)  // 0=welcome, 1,2,3=steps, 4=done
  const [university, setUniversity] = useState('')
  const [area, setArea]            = useState('')
  const [squad, setSquad]          = useState([])

  const finish = () => {
    setStep(4)
    setTimeout(() => onComplete({ university, area, squad }), 1800)
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 70%)' }}>

      {/* Particle dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-purple-400/20 star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--dur': `${2 + Math.random() * 3}s`,
              '--delay': `${Math.random() * 2}s`,
            }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-sm mx-auto w-full px-6 py-8">

        {/* Welcome screen */}
        {step === 0 && (
          <div className="flex flex-col flex-1 animate-fade-in">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative animate-float">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900 to-quest-bg border-2 border-purple-700/60 flex items-center justify-center"
                  style={{ boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
                  <Moon size={36} className="text-purple-300" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-3xl font-black text-shimmer">NightQuest</h1>
                <p className="font-body text-base text-gray-400 leading-relaxed">
                  Your RPG companion for a legendary night out. Complete quests, discover venues, stay safe with your squad.
                </p>
              </div>

              <div className="w-full space-y-2 text-left">
                {[
                  { icon: '🎮', label: '30 quests', sub: 'earn XP and level up your night' },
                  { icon: '🗺️', label: '20 venues',  sub: 'live busyness · happy hours · deals' },
                  { icon: '🛡️', label: 'Safety first', sub: 'buddy check-ins · trusted contacts' },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-2.5 bg-quest-panel/60 border border-quest-border/60 rounded-xl">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="font-display text-xs font-bold text-gray-200">{label}</p>
                      <p className="font-body text-[11px] text-gray-600">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900/20 border border-green-800/40">
                <span className="text-xs">🔒</span>
                <p className="font-display text-[10px] text-green-400 uppercase tracking-widest font-bold">
                  No account · No signup · Your data only
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button onClick={() => setStep(1)}
                className="relative group w-full btn-press">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 to-quest-gold opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2 py-4 rounded-xl bg-quest-bg border border-purple-700/60 font-display text-base font-bold uppercase tracking-widest text-quest-gold">
                  <Moon size={16} /> Get Started
                </div>
              </button>
              <button onClick={() => onComplete({ university: '', area: '', squad: [] })}
                className="w-full py-2 text-gray-700 font-display text-[10px] uppercase tracking-widest hover:text-gray-500 transition-colors">
                Skip setup — browse first
              </button>
            </div>
          </div>
        )}

        {/* Steps 1-3 */}
        {step >= 1 && step <= 3 && (
          <div className="flex flex-col flex-1">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <p className="font-display text-[10px] uppercase tracking-widest text-gray-600">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <button onClick={() => onComplete({ university, area, squad })}
                  className="text-gray-700 hover:text-gray-500 font-display text-[10px] uppercase tracking-wider transition-colors">
                  Skip all
                </button>
              </div>
              <ProgressBar step={step - 1} />
            </div>

            <div className="flex-1">
              {step === 1 && (
                <StepUniversity
                  value={university}
                  onChange={setUniversity}
                  onNext={() => setStep(2)}
                  onSkip={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <StepArea
                  value={area}
                  onChange={setArea}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                  onSkip={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <StepSquad
                  squad={squad}
                  setSquad={setSquad}
                  onFinish={finish}
                  onBack={() => setStep(2)}
                />
              )}
            </div>
          </div>
        )}

        {/* Done */}
        {step === 4 && (
          <div className="flex flex-col flex-1 justify-center">
            <StepDone university={university} area={area} />
          </div>
        )}
      </div>
    </div>
  )
}
