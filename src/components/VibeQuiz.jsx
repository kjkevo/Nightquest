import { useState } from 'react'
import { ChevronRight, RotateCcw, Sparkles, MapPin, Star, ArrowRight } from 'lucide-react'
import { QUIZ_QUESTIONS, scoreVenue } from '../data/quizData'
import { VENUES } from '../data/venues'

// ── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all duration-300
          ${i < current  ? 'w-4 h-1.5 bg-quest-gold' :
            i === current ? 'w-4 h-1.5 bg-purple-400 animate-pulse' :
                            'w-1.5 h-1.5 bg-gray-700'}`} />
      ))}
    </div>
  )
}

// ── Single question view ──────────────────────────────────────────────────────
function QuizQuestion({ q, onAnswer, questionNum, totalQuestions }) {
  const [selected, setSelected] = useState(null)

  const choose = (optId) => {
    setSelected(optId)
    setTimeout(() => onAnswer(q.id, optId), 300)
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="text-center">
        <div className="text-3xl mb-2">{q.emoji}</div>
        <p className="font-body text-[9px] text-gray-600 uppercase tracking-widest mb-1">
          Question {questionNum} of {totalQuestions}
        </p>
        <h3 className="font-display text-base font-bold text-gray-100">{q.question}</h3>
      </div>

      <div className="space-y-2">
        {q.options.map(opt => (
          <button
            key={opt.id}
            onClick={() => choose(opt.id)}
            disabled={!!selected}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 btn-press text-left
              ${selected === opt.id
                ? 'bg-quest-gold/20 border-quest-gold text-quest-gold'
                : selected
                  ? 'bg-quest-panel border-quest-border text-gray-600 opacity-50'
                  : 'bg-quest-panel border-quest-border text-gray-200 hover:border-purple-700/60 hover:bg-purple-900/10'}`}
          >
            <span className="text-xl w-7 text-center flex-shrink-0">{opt.emoji}</span>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-wider">{opt.label}</p>
              <p className="font-body text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
            </div>
            {selected === opt.id && <ChevronRight size={14} className="ml-auto text-quest-gold" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Results card ──────────────────────────────────────────────────────────────
function ResultsView({ answers, onRetake, onAddToPlan }) {
  const scored = VENUES
    .map(v => ({ ...v, matchScore: scoreVenue(v, answers) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)

  const top = scored[0]

  const scoreColor = (s) =>
    s >= 85 ? 'text-green-400' : s >= 65 ? 'text-quest-gold' : s >= 45 ? 'text-orange-400' : 'text-gray-500'

  const scoreBg = (s) =>
    s >= 85 ? 'bg-green-500/20 border-green-700' : s >= 65 ? 'bg-quest-gold/10 border-quest-gold-dim' :
    s >= 45 ? 'bg-orange-900/20 border-orange-800' : 'bg-gray-800 border-gray-700'

  return (
    <div className="animate-fade-in space-y-4">
      {/* Hero match */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-700/50 mb-2">
          <Sparkles size={10} className="text-purple-400" />
          <span className="font-display text-[10px] uppercase tracking-widest text-purple-300">Your vibe match</span>
        </div>
        <h3 className="font-display text-xl font-black text-shimmer">{top.name}</h3>
        <p className="font-body text-sm text-gray-400 mt-1">{top.neighborhood} · {top.type}</p>
        <div className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full border text-sm font-display font-bold ${scoreBg(top.matchScore)} ${scoreColor(top.matchScore)}`}>
          <Star size={11} fill="currentColor" />
          {top.matchScore}% match
        </div>
      </div>

      {/* Top pick details */}
      <div className="bg-quest-panel border border-quest-border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {top.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-purple-900/30 border border-purple-800/40 text-[10px] font-display text-purple-300">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[11px] font-body text-gray-400">
          <span className="flex items-center gap-1"><MapPin size={10} />{top.distanceMiles}mi</span>
          <span>💰 {'$'.repeat(top.priceRange)}</span>
          <span>⭐ {top.rating}</span>
        </div>
        <button
          onClick={() => onAddToPlan(top)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-700 to-purple-600 text-white font-display text-xs font-bold uppercase tracking-widest btn-press"
        >
          <ArrowRight size={12} /> Add to Tonight's Plan
        </button>
      </div>

      {/* Runner ups */}
      {scored.length > 1 && (
        <div className="space-y-1.5">
          <p className="font-display text-[10px] uppercase tracking-widest text-gray-600 px-1">Also worth considering</p>
          {scored.slice(1, 4).map(v => (
            <button
              key={v.id}
              onClick={() => onAddToPlan(v)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-quest-panel border border-quest-border hover:border-gray-600 transition-all btn-press"
            >
              <div className="text-left flex-1 min-w-0">
                <p className="font-display text-xs font-bold text-gray-200 truncate">{v.name}</p>
                <p className="font-body text-[10px] text-gray-600">{v.neighborhood} · {v.type}</p>
              </div>
              <div className={`text-xs font-display font-bold flex-shrink-0 ${scoreColor(v.matchScore)}`}>
                {v.matchScore}%
              </div>
              <ArrowRight size={11} className="text-gray-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onRetake}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-quest-border text-gray-600 hover:text-gray-400 font-display text-[10px] uppercase tracking-widest transition-colors"
      >
        <RotateCcw size={10} /> Retake quiz
      </button>
    </div>
  )
}

// ── Main VibeQuiz ─────────────────────────────────────────────────────────────
export default function VibeQuiz({ onAddToPlan, onClose }) {
  const [step, setStep]       = useState(0)   // 0 = intro, 1-5 = questions, 6 = results
  const [answers, setAnswers] = useState({})

  const totalQ = QUIZ_QUESTIONS.length

  const handleAnswer = (qId, optId) => {
    const newAnswers = { ...answers, [qId]: optId }
    setAnswers(newAnswers)
    if (step >= totalQ) {
      setStep(totalQ + 1)
    } else {
      setStep(s => s + 1)
    }
  }

  const handleRetake = () => {
    setAnswers({})
    setStep(0)
  }

  return (
    <div className="bg-quest-panel border border-quest-border rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-gray-200">
            Vibe Quiz
          </h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 font-display text-xs transition-colors">✕</button>
        )}
      </div>

      {/* Intro */}
      {step === 0 && (
        <div className="animate-fade-in text-center space-y-4 py-2">
          <div className="text-4xl">🔮</div>
          <div>
            <h3 className="font-display text-lg font-black text-shimmer">Find Your Venue</h3>
            <p className="font-body text-sm text-gray-400 mt-1">
              5 questions. 30 seconds. We'll match you to the right spot tonight.
            </p>
          </div>
          <button
            onClick={() => setStep(1)}
            className="relative group btn-press"
          >
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-quest-gold opacity-50 blur-sm group-hover:opacity-80 transition-opacity" />
            <div className="relative px-8 py-3 rounded-xl bg-quest-bg border border-purple-700/60 font-display text-sm font-bold uppercase tracking-widest text-quest-gold">
              Let's Go <ChevronRight size={14} className="inline" />
            </div>
          </button>
        </div>
      )}

      {/* Questions */}
      {step >= 1 && step <= totalQ && (
        <>
          <ProgressDots total={totalQ} current={step - 1} />
          <QuizQuestion
            key={step}
            q={QUIZ_QUESTIONS[step - 1]}
            onAnswer={handleAnswer}
            questionNum={step}
            totalQuestions={totalQ}
          />
        </>
      )}

      {/* Results */}
      {step > totalQ && (
        <ResultsView
          answers={answers}
          onRetake={handleRetake}
          onAddToPlan={(v) => { onAddToPlan?.(v); onClose?.() }}
        />
      )}
    </div>
  )
}
