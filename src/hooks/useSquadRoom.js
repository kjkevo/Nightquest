/**
 * useSquadRoom — serverless squad room system
 *
 * How it works:
 *   1. Host calls createRoom() → gets a 6-char code + a shareable URL.
 *      The URL embeds all room data (tasks, outing, difficulty) as URL-safe
 *      Base64 so friends on other devices can decode it without any server.
 *      The same data is also saved to localStorage so same-device code entry works.
 *
 *   2. Guest calls joinByCode(code) → tries localStorage first (same device / same
 *      browser), then checks the current URL's `r` param for a matching room.
 *
 *   3. Guest or host visits a URL with ?r=BASE64 → call getRoomFromUrl() to decode.
 */

const STORAGE_KEY = 'nq_squad_rooms'
const URL_PARAM   = 'r'

// ─── Codec (UTF-8 safe URL-safe Base64) ──────────────────────────────────────
function encode(obj) {
  try {
    const json  = JSON.stringify(obj)
    const bytes = new TextEncoder().encode(json)
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch { return null }
}

function decode(str) {
  try {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/')
    const pad    = padded.length % 4 ? 4 - (padded.length % 4) : 0
    const bin    = atob(padded + '='.repeat(pad))
    const bytes  = Uint8Array.from(bin, c => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch { return null }
}

// ─── Code generation (readable, unambiguous chars) ───────────────────────────
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // no 0/O/1/I

function genCode() {
  let code = ''
  const arr = new Uint8Array(6)
  crypto.getRandomValues(arr)
  for (const b of arr) code += ALPHABET[b % ALPHABET.length]
  return code
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadRooms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  catch { return {} }
}

function saveRooms(rooms) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms)) } catch {}
}

function pruneOldRooms(rooms) {
  const cutoff = Date.now() / 1000 - 86400  // 24 hours
  return Object.fromEntries(
    Object.entries(rooms).filter(([, r]) => r.at > cutoff)
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a squad room from an already-generated task list.
 * Returns { code, url, room } or null on failure.
 *
 * `hostKey` — the creator's stable session key. Embedded in the room so
 *   every device that decodes the URL knows who the host is. The host gets
 *   crown badge + kick/limit-bypass privileges in the UI.
 */
export function createRoom(tasks, outingId, difficultyId, playerCount, hostKey = null) {
  const code = genCode()
  const room = {
    v:  1,
    code,
    o:  outingId,
    di: difficultyId,
    n:  playerCount,
    h:  hostKey,                // host's session key (or null if unknown)
    // Strip heavy fields (assignedPlayers array of names) — keep only task data
    t:  tasks.map(t => ({
      id:    t.id,
      title: t.title,
      desc:  t.desc  ?? t.description ?? '',
      tip:   t.tip   ?? '',
      xp:    t.xp    ?? 0,
      xpPerPlayer: t.xpPerPlayer,  // squad-specific, may be undefined
    })),
    at: Math.floor(Date.now() / 1000),
  }

  // Persist locally so same-device code entry works
  const rooms = pruneOldRooms(loadRooms())
  rooms[code]  = room
  saveRooms(rooms)

  // Build shareable URL
  const encoded = encode(room)
  if (!encoded) return null
  const base = `${window.location.origin}${window.location.pathname}`
  const url  = `${base}?${URL_PARAM}=${encoded}`

  return { code, url, room }
}

/**
 * Try to load a room by 6-char code.
 * Checks localStorage first, then the current URL's `r` param (if the code matches).
 * Returns the room object or null.
 */
export function joinByCode(code) {
  const upper = code.trim().toUpperCase()

  // 1. localStorage (same device / same browser)
  const rooms = loadRooms()
  if (rooms[upper]) return rooms[upper]

  // 2. Current URL param (in case the joiner opened the link already)
  const fromUrl = getRoomFromUrl()
  if (fromUrl && fromUrl.code === upper) return fromUrl

  return null
}

/**
 * Decode room data from the current page URL (?r=BASE64).
 * Returns the room object or null.
 */
export function getRoomFromUrl(search = window.location.search) {
  const params  = new URLSearchParams(search)
  const encoded = params.get(URL_PARAM)
  if (!encoded) return null
  const room = decode(encoded)
  if (!room || !room.t || !room.o || room.v !== 1) return null

  // Cache in localStorage so code-entry also works after URL is opened
  const rooms = pruneOldRooms(loadRooms())
  if (!rooms[room.code]) {
    rooms[room.code] = room
    saveRooms(rooms)
  }
  return room
}

/**
 * Build a shareable URL for an *existing* room object.
 * Safe to call at any point during play — uses the room's existing code,
 * so the same link works for both the host and any guest who wants to
 * forward the invite to a late arrival.
 */
export function getShareUrl(room) {
  if (!room) return null
  try {
    const encoded = encode(room)
    if (!encoded) return null
    const base = `${window.location.origin}${window.location.pathname}`
    return `${base}?${URL_PARAM}=${encoded}`
  } catch { return null }
}

/** Remove the ?r= param from the address bar without a page reload. */
export function clearRoomParam() {
  const url = new URL(window.location.href)
  if (url.searchParams.has(URL_PARAM)) {
    url.searchParams.delete(URL_PARAM)
    window.history.replaceState({}, '', url.toString())
  }
}
