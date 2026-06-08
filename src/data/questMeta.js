/**
 * questMeta.js — derive category & time-estimate from quest text + XP.
 *
 * The 7,500+ outing quests don't have explicit category or time fields,
 * so we infer them from the title/description keywords and XP value.
 */

const CATEGORY_RULES = [
  { id: 'social',  label: 'Social',  emoji: '💬', color: '#22d3ee',
    keywords: /\b(ask|talk|chat|compliment|name|introduce|stranger|conversation|listen|share|hype)\b/i },
  { id: 'drink',   label: 'Drink',   emoji: '🍹', color: '#f59e0b',
    keywords: /\b(order|drink|shot|bartender|cocktail|menu|happy hour|brew|sip)\b/i },
  { id: 'dance',   label: 'Dance',   emoji: '💃', color: '#ec4899',
    keywords: /\b(dance|dancing|dancefloor|move|groove|song|music|dj|beat)\b/i },
  { id: 'perform', label: 'Perform', emoji: '🎤', color: '#a855f7',
    keywords: /\b(sing|perform|joke|stage|mic|act|toast|speech|story)\b/i },
  { id: 'explore', label: 'Explore', emoji: '🔍', color: '#4ade80',
    keywords: /\b(find|spot|discover|scout|scan|look|locate|seek|search|investigate)\b/i },
  { id: 'squad',   label: 'Squad',   emoji: '👥', color: '#f0c060',
    keywords: /\b(squad|group|team|crew|everyone|together|whole|all of)\b/i },
  { id: 'daring',  label: 'Daring',  emoji: '⚡', color: '#ef4444',
    keywords: /\b(dare|challenge|bet|wager|stranger|kiss|first|bold|risk)\b/i },
]

/** Infer the dominant category for a task. */
export function inferCategory(task) {
  // Party quests already have a category field
  if (task.category) {
    const id = task.category.toLowerCase()
    const match = CATEGORY_RULES.find(c => c.id === id || c.label.toLowerCase() === id)
    if (match) return match
  }

  // Otherwise scan title + description
  const text = `${task.title ?? ''} ${task.desc ?? task.description ?? ''}`
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(text)) return rule
  }
  // Fallback
  return CATEGORY_RULES[0]
}

/**
 * Estimate quest duration from XP value.
 *   Easy   (XP 40–55)  → ~3 min
 *   Medium (XP 60–85)  → ~7 min
 *   Hard   (XP 90+)    → ~12 min
 * Falls back on explicit `timeLimitMinutes` if present.
 */
export function estimateMins(task) {
  if (task.timeLimitMinutes) return task.timeLimitMinutes
  const xp = task.xp ?? task.points ?? 0
  if (xp <= 55)  return 3
  if (xp <= 85)  return 7
  if (xp <= 110) return 12
  return 18
}

/** Difficulty tier label from XP. */
export function difficultyFromXP(task) {
  const xp = task.xp ?? task.points ?? 0
  if (xp <= 55)  return { id: 'easy',   label: 'Easy',   color: '#22c55e', stars: 1 }
  if (xp <= 85)  return { id: 'medium', label: 'Medium', color: '#f59e0b', stars: 2 }
  return         { id: 'hard',   label: 'Hard',   color: '#ef4444', stars: 3 }
}

export const ALL_CATEGORIES = CATEGORY_RULES
