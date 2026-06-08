/**
 * useSeenTasks — tracks which mission IDs the player has already been served,
 * keyed by (outingId, difficultyId, playerCount).
 *
 * Used to guarantee a "fresh set of missions" every time the user re-enters
 * a session: the picker first removes everything already seen for that key,
 * and only falls back to seen tasks once the pool is fully exhausted (then
 * the cycle resets and the pool is fresh again).
 *
 * Storage: nq_seen_tasks (JSON: { "<key>": ["taskId", ...] })
 */

const KEY = 'nq_seen_tasks'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? {} }
  catch { return {} }
}

function save(obj) {
  try { localStorage.setItem(KEY, JSON.stringify(obj)) } catch {}
}

/** Build the localStorage key for a given outing/diff/playerCount combo. */
function makeKey(outingId, difficultyId, playerCount = 'solo') {
  return `${outingId || 'unknown'}_${difficultyId || 'easy'}_${playerCount}`
}

/**
 * Pick `count` fresh tasks from `pool`. Tasks already served for this
 * (outing, difficulty, playerCount) combo are skipped — unless the pool
 * has fewer remaining-unseen tasks than `count`, in which case the
 * seen list for that combo is reset and we pick anew from the full pool.
 */
export function pickFreshTasks(pool, count, outingId, difficultyId, playerCount = 'solo') {
  if (!Array.isArray(pool) || pool.length === 0) return []
  const all   = [...pool]
  const seen  = load()
  const key   = makeKey(outingId, difficultyId, playerCount)
  const seenIds = new Set(seen[key] ?? [])

  // Filter to unseen tasks
  let unseen = all.filter(t => !seenIds.has(t.id))

  // Cycle reset: if we can't fill the requested count from unseen alone,
  // wipe the seen list for this key and start over.
  if (unseen.length < count) {
    seen[key] = []
    unseen = [...all]
  }

  // Fisher-Yates shuffle the unseen subset
  for (let i = unseen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseen[i], unseen[j]] = [unseen[j], unseen[i]]
  }

  const picked = unseen.slice(0, Math.min(count, unseen.length))

  // Record these picks as seen
  seen[key] = [...(seen[key] ?? []), ...picked.map(p => p.id)]
  save(seen)

  return picked
}

/** Reset the entire seen history (e.g. user wants to start over from scratch). */
export function resetSeenTasks() {
  try { localStorage.removeItem(KEY) } catch {}
}

/** Reset just one combo's history. */
export function resetSeenForCombo(outingId, difficultyId, playerCount = 'solo') {
  const seen = load()
  delete seen[makeKey(outingId, difficultyId, playerCount)]
  save(seen)
}
