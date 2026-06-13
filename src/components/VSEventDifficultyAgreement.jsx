import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { OUTING_TYPES, DIFFICULTIES } from '../data/outingQuests'

export default function VSEventDifficultyAgreement({ teamName, team2Name, code, onStart, onBack }) {
  const [selectedOuting, setSelectedOuting] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)
  const [expandedOuting, setExpandedOuting] = useState(null)
  const [expandedDifficulty, setExpandedDifficulty] = useState(null)

  const canStart = selectedOuting && selectedDifficulty

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="text-center py-4">
        <p className="font-display text-sm font-bold text-white">Teams Agree on Challenge</p>
        <p className="font-body text-xs text-gray-500 mt-1">Both teams must choose the same event & difficulty</p>
      </div>

      {/* Teams Status */}
      <div className="bg-quest-panel border border-quest-border rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="font-display text-xs uppercase tracking-widest text-gray-500">Team 1</p>
            <p className="font-display text-sm font-bold text-white mt-1">{teamName}</p>
            <p className="font-body text-xs text-gray-600 mt-1">👤</p>
          </div>
          <div className="text-xl">⚔️</div>
          <div className="text-center flex-1">
            <p className="font-display text-xs uppercase tracking-widest text-gray-500">Team 2</p>
            <p className="font-display text-sm font-bold text-white mt-1">{team2Name || 'Joined'}</p>
            <p className="font-body text-xs text-gray-600 mt-1">👤</p>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <div className="space-y-2">
        <p className="font-display text-xs uppercase tracking-widest text-gray-500">Pick Event</p>
        <div className="space-y-2">
          {OUTING_TYPES.map(outing => (
            <div key={outing.id}>
              <button
                onClick={() => {
                  setSelectedOuting(selectedOuting?.id === outing.id ? null : outing)
                  setExpandedOuting(expandedOuting === outing.id ? null : outing.id)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                  selectedOuting?.id === outing.id
                    ? 'bg-quest-gold/10 border-quest-gold'
                    : 'bg-quest-bg border-quest-border hover:border-quest-gold-dim'
                }`}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{outing.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-white">{outing.label}</p>
                    <p className="font-body text-xs text-gray-600 line-clamp-1">{outing.desc}</p>
                  </div>
                </div>
                {selectedOuting?.id === outing.id && (
                  <CheckCircle size={20} className="text-quest-gold ml-2 flex-shrink-0" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Selection */}
      {selectedOuting && (
        <div className="space-y-2 animate-fade-in">
          <p className="font-display text-xs uppercase tracking-widest text-gray-500">Pick Difficulty</p>
          <div className="space-y-2">
            {DIFFICULTIES.map(diff => (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(selectedDifficulty?.id === diff.id ? null : diff)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                  selectedDifficulty?.id === diff.id
                    ? 'border-2'
                    : 'border'
                }`}
                style={
                  selectedDifficulty?.id === diff.id
                    ? { borderColor: diff.color, background: `${diff.color}15` }
                    : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }
                }>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">
                    {diff.id === 'easy' && '🟢'}
                    {diff.id === 'medium' && '🟠'}
                    {diff.id === 'hard' && '🔴'}
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-white">{diff.label}</p>
                    <p className="font-body text-xs text-gray-500">{diff.taskCount} tasks • {diff.xpRange[0]}–{diff.xpRange[1]} XP each</p>
                  </div>
                </div>
                {selectedDifficulty?.id === diff.id && (
                  <CheckCircle size={20} className="ml-2 flex-shrink-0" style={{ color: diff.color }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {canStart && (
        <div className="bg-gradient-to-r from-quest-gold/10 to-quest-gold/5 border border-quest-gold/30 rounded-lg p-4 space-y-2 animate-fade-in">
          <p className="font-display text-xs uppercase tracking-widest text-quest-gold">Ready to Battle</p>
          <p className="font-body text-sm text-gray-300">
            <span className="font-bold">{selectedOuting.emoji} {selectedOuting.label}</span> at <span className="font-bold">{selectedDifficulty.label}</span>
          </p>
          <p className="font-body text-xs text-gray-500">
            Both teams will get the same challenges. First to complete all wins! ⚔️
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => onStart(selectedOuting, selectedDifficulty)}
          disabled={!canStart}
          className={`w-full py-3 rounded-xl font-display text-sm font-black uppercase tracking-widest transition-all btn-press ${
            canStart
              ? 'bg-gradient-to-r from-quest-gold-dim to-quest-gold text-quest-bg hover:brightness-110'
              : 'bg-quest-panel text-gray-600 cursor-not-allowed'
          }`}>
          {canStart ? 'Start Battle ⚔️' : 'Choose Event & Difficulty'}
        </button>

        <button
          onClick={onBack}
          className="w-full py-2 rounded-lg border border-red-900/40 text-red-400 hover:text-red-300 font-display text-xs font-bold uppercase tracking-widest transition-colors">
          Back
        </button>
      </div>

      {/* Code Reference */}
      <p className="text-center font-body text-[10px] text-gray-700">Code: {code}</p>
    </div>
  )
}
