import { useState, useMemo, useCallback } from 'react'

const KEY = 'nq_costs'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(expenses) {
  localStorage.setItem(KEY, JSON.stringify(expenses))
}

// Greedy settle-up: minimum transactions to zero out all balances
function calculateSettleUp(balances) {
  const txns = []
  const pos = Object.entries(balances).filter(([, b]) => b >  0.005).map(([id, amt]) => ({ id, amt })).sort((a, b) => b.amt - a.amt)
  const neg = Object.entries(balances).filter(([, b]) => b < -0.005).map(([id, amt]) => ({ id, amt: -amt })).sort((a, b) => b.amt - a.amt)
  let pi = 0, ni = 0
  while (pi < pos.length && ni < neg.length) {
    const creditor = pos[pi], debtor = neg[ni]
    const amount = Math.min(creditor.amt, debtor.amt)
    txns.push({ from: debtor.id, to: creditor.id, amount: Math.round(amount * 100) / 100 })
    creditor.amt -= amount; debtor.amt -= amount
    if (creditor.amt < 0.005) pi++
    if (debtor.amt  < 0.005) ni++
  }
  return txns
}

export const EXPENSE_CATEGORIES = [
  { id: 'cover',  label: 'Cover',    emoji: '🎫', color: '#7c3aed' },
  { id: 'uber',   label: 'Uber/Lyft',emoji: '🚗', color: '#06b6d4' },
  { id: 'round',  label: 'Round',    emoji: '🍺', color: '#f97316' },
  { id: 'food',   label: 'Food',     emoji: '🍕', color: '#22c55e' },
  { id: 'other',  label: 'Other',    emoji: '💸', color: '#6b7280' },
]

export function useCosts(members) {
  const [expenses, setExpenses] = useState(load)

  const allParticipants = useMemo(() => [
    { id: 'me', name: 'You', emoji: '⭐' },
    ...members.map(m => ({ id: m.id, name: m.name, emoji: m.emoji })),
  ], [members])

  const addExpense = useCallback((exp) => {
    const next = [...expenses, { id: Date.now(), ...exp, ts: Date.now() }]
    setExpenses(next); save(next)
  }, [expenses])

  const removeExpense = useCallback((id) => {
    const next = expenses.filter(e => e.id !== id)
    setExpenses(next); save(next)
  }, [expenses])

  const clearAll = useCallback(() => {
    setExpenses([]); localStorage.removeItem(KEY)
  }, [])

  const balances = useMemo(() => {
    const b = {}
    allParticipants.forEach(p => { b[p.id] = 0 })
    for (const exp of expenses) {
      const splitCount = exp.splitBetween?.length || 1
      const share = exp.amount / splitCount
      if (b[exp.paidBy] !== undefined) b[exp.paidBy] += exp.amount
      exp.splitBetween?.forEach(id => { if (b[id] !== undefined) b[id] -= share })
    }
    return b
  }, [expenses, allParticipants])

  const settleUp = useMemo(() => calculateSettleUp(balances), [balances])

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0)

  return { expenses, balances, settleUp, totalSpend, allParticipants, addExpense, removeExpense, clearAll }
}
