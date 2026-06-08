import { useState, useEffect, useCallback } from 'react'
import { getLevelInfo } from '../data/quests'

function safeRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}

export function useGameState() {
  const [totalXP, setTotalXP] = useState(() => safeRead('nq_xp', 0))
  const [history, setHistory] = useState(() => safeRead('nq_history', []))
  const [levelUpData, setLevelUpData] = useState(null)

  useEffect(() => { localStorage.setItem('nq_xp', JSON.stringify(totalXP)) }, [totalXP])
  useEffect(() => { localStorage.setItem('nq_history', JSON.stringify(history)) }, [history])

  const completeQuest = useCallback((quest) => {
    setTotalXP(prev => {
      const oldLevel = getLevelInfo(prev).level
      const newXP = prev + quest.xp
      const newLevel = getLevelInfo(newXP).level
      if (newLevel > oldLevel) {
        setTimeout(() => setLevelUpData(getLevelInfo(newXP)), 300)
      }
      return newXP
    })
    setHistory(prev => [
      { quest, completedAt: Date.now() },
      ...prev,
    ].slice(0, 100))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem('nq_history')
  }, [])

  const resetAll = useCallback(() => {
    setTotalXP(0)
    setHistory([])
    localStorage.removeItem('nq_xp')
    localStorage.removeItem('nq_history')
  }, [])

  const dismissLevelUp = useCallback(() => setLevelUpData(null), [])

  return {
    totalXP,
    levelInfo: getLevelInfo(totalXP),
    history,
    levelUpData,
    dismissLevelUp,
    completeQuest,
    clearHistory,
    resetAll,
  }
}
