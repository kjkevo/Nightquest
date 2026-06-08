#!/usr/bin/env node
/**
 * scripts/prerender-quests.mjs
 *
 * Generates /public/quests/index.html from live quest data so the full
 * quest catalogue is server-renderable and indexable by search engines.
 *
 * Run:  node scripts/prerender-quests.mjs
 * Also: automatically runs before `vite build` via package.json scripts.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import vm from 'vm'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Canonical site URL — override at build time via SITE_URL env var.
// When you connect a custom domain (e.g. nightquest.app), set SITE_URL in
// Vercel project settings → Environment Variables and redeploy.
const SITE_URL = (process.env.SITE_URL || 'https://nightquest-one.vercel.app').replace(/\/$/, '')

// Helper: read + strip + run in vm, returns named exports from the context
function loadData(relPath, extraSetup = '') {
  const src = readFileSync(join(root, relPath), 'utf-8')
  const stripped = src
    .replace(/\bimport\s+.*?from\s+['"][^'"]+['"]/gs, '')   // strip import statements (single- or multi-line)
    .replace(/^export\s*\{[^}]*\}\s*from\s*['"][^'"]+['"]\s*$/mg, '') // strip re-export: export { X } from '...'
    .replace(/\bicon:\s*\w+,/g, '')                          // strip icon: Icon,
    .replace(/^export\s+/mg, '')                             // strip export keyword from declarations
  const ctx = vm.createContext({ _VQ: {} })   // _VQ stub so outingQuests doesn't blow up
  vm.runInContext(stripped + '\n' + extraSetup, ctx)
  return ctx
}

// ── 1. Load venueQuests.js ────────────────────────────────────────────────────
const vqCtx = loadData('src/data/venueQuests.js', '__out = SQUAD_VENUE_QUESTS')
const SQUAD_VENUE_QUESTS = vqCtx.__out

// ── 2. Load outingQuests.js (all squad exports + solo + challenges) ───────────
const oqCtx = loadData('src/data/outingQuests.js', `__out = {
  SOLO_QUESTS, OUTING_TYPES, SQUAD_CHALLENGES,
  SQUAD_DUO_QUESTS, SQUAD_TRIO_QUESTS, SQUAD_QUAD_QUESTS,
  SQUAD_PENTA_QUESTS, SQUAD_HEXA_QUESTS, SQUAD_HEPTA_QUESTS,
  SQUAD_OCTA_QUESTS, SQUAD_NONA_QUESTS, SQUAD_DECA_QUESTS,
}`)
const {
  SOLO_QUESTS, OUTING_TYPES, SQUAD_CHALLENGES,
  SQUAD_DUO_QUESTS, SQUAD_TRIO_QUESTS, SQUAD_QUAD_QUESTS,
  SQUAD_PENTA_QUESTS, SQUAD_HEXA_QUESTS, SQUAD_HEPTA_QUESTS,
  SQUAD_OCTA_QUESTS, SQUAD_NONA_QUESTS, SQUAD_DECA_QUESTS,
} = oqCtx.__out

// ── 3. Load quests.js (has lucide-react import — stripped by loadData) ────────
const qCtx = loadData('src/data/quests.js', '__out = { QUESTS, CATEGORIES }')
const { QUESTS, CATEGORIES } = qCtx.__out

// ── 4. Count every quest in the library ───────────────────────────────────────
// Recursively count all arrays of quest objects at any depth
function countArrayItems(obj) {
  if (!obj || typeof obj !== 'object') return 0
  if (Array.isArray(obj)) return obj.length
  return Object.values(obj).reduce((sum, v) => sum + countArrayItems(v), 0)
}

// Bar squad quests live in per-player-count exports (SQUAD_DUO_QUESTS … SQUAD_DECA_QUESTS)
const BAR_SQUAD_EXPORTS = [
  SQUAD_DUO_QUESTS, SQUAD_TRIO_QUESTS, SQUAD_QUAD_QUESTS,
  SQUAD_PENTA_QUESTS, SQUAD_HEXA_QUESTS, SQUAD_HEPTA_QUESTS,
  SQUAD_OCTA_QUESTS, SQUAD_NONA_QUESTS, SQUAD_DECA_QUESTS,
]

// Count per venue across all sources
const countByVenue = {}
for (const { id } of OUTING_TYPES) {
  let n = 0
  n += countArrayItems(SOLO_QUESTS[id])           // solo quests
  n += countArrayItems(SQUAD_CHALLENGES[id])       // squad challenge quests
  if (id === 'bar') {
    for (const exp of BAR_SQUAD_EXPORTS) n += countArrayItems(exp.bar)
  } else {
    n += countArrayItems(SQUAD_VENUE_QUESTS[id])   // club/rave/openmic/casino squad quests
  }
  countByVenue[id] = n
}

const partyCount  = QUESTS.length
const venueTotal  = Object.values(countByVenue).reduce((a, b) => a + b, 0)
const total       = partyCount + venueTotal

// ── 5. Collect venue breakdown + sample quest titles ─────────────────────────
const venueBreakdown = OUTING_TYPES.map(outing => {
  const soloVenue = SOLO_QUESTS[outing.id] || {}
  const samples = []
  for (const quests of Object.values(soloVenue)) {
    for (const q of quests) {
      if (samples.length < 4) samples.push(q.title)
    }
  }
  return {
    ...outing,
    total: countByVenue[outing.id] || 0,
    samples,
  }
})

// ── 6. HTML helpers ───────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const RARITY_COLOR  = { common: '#9ca3af', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f97316' }
const CATEGORY_COLOR = { Social: '#22d3ee', Daring: '#f43f5e', Challenge: '#f59e0b', Chill: '#4ade80', Wild: '#a855f7' }

function questCard(q) {
  const rc = RARITY_COLOR[q.rarity] ?? '#9ca3af'
  const cc = CATEGORY_COLOR[q.category] ?? '#9ca3af'
  return `
    <article class="qcard" style="border-color:${rc}33">
      <div class="qcard-head">
        <span class="qcat" style="color:${cc};border-color:${cc}33">${esc(q.category)}</span>
        <span class="qxp">${q.xp} XP</span>
      </div>
      <h3 class="qtitle">${esc(q.title)}</h3>
      <p class="qdesc">${esc(q.description)}</p>
      <span class="qrarity" style="color:${rc}">${esc(q.rarity)}</span>
    </article>`
}

// ── 7. Build the page ─────────────────────────────────────────────────────────
const jsonLdItems = QUESTS.map((q, i) => ({
  '@type': 'ListItem',
  position: i + 1,
  name: q.title,
  description: q.description,
}))

const html = /* html */`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NightQuest Quest Library — ${total.toLocaleString()}+ Missions Across 5 Venue Types</title>
  <meta name="description" content="Browse all ${total.toLocaleString()}+ NightQuest missions: solo party challenges, bar night quests, club dares, rave missions, and open mic tasks for groups of 2–10 players." />
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${SITE_URL}/quests" />
  <meta property="og:title"       content="NightQuest Quest Library — ${total.toLocaleString()}+ Nightlife Missions" />
  <meta property="og:description" content="Every quest in NightQuest — solo, squad, and venue-specific challenges for your night out." />
  <link rel="canonical"   href="${SITE_URL}/quests" />
  <link rel="preconnect"  href="https://fonts.googleapis.com" />
  <link rel="preconnect"  href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#0a0a0f;--panel:#111118;--border:#1e1e2e;
      --gold:#f0c060;--purple:#7c3aed;--text:#e5e7eb;--muted:#6b7280;
    }
    body{background:var(--bg);color:var(--text);font-family:'Crimson Text',Georgia,serif;line-height:1.6;min-height:100vh}
    .wrap{max-width:920px;margin:0 auto;padding:0 1.25rem}

    /* header */
    .hdr{background:linear-gradient(180deg,#0d0d18,var(--bg));border-bottom:1px solid var(--border);padding:1.25rem 0}
    .hdr-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
    .logo{display:flex;align-items:center;gap:.75rem;text-decoration:none}
    .logo-icon{width:2.5rem;height:2.5rem;border-radius:50%;background:radial-gradient(circle at 40% 40%,#4c1d95,#0a0a0f);border:2px solid #581c87;display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 0 16px rgba(124,58,237,.4)}
    .logo-name{font-family:'Cinzel',serif;font-size:1.2rem;font-weight:900;color:var(--gold);letter-spacing:.05em}
    .btn{display:inline-block;padding:.55rem 1.4rem;background:linear-gradient(135deg,var(--purple),#4f46e5);color:#fff;border-radius:.6rem;font-family:'Cinzel',serif;font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;box-shadow:0 0 18px rgba(124,58,237,.4);transition:opacity .2s}
    .btn:hover{opacity:.85}

    /* breadcrumb */
    .bc{padding:.6rem 0;font-size:.8rem;color:var(--muted)}
    .bc a{color:#6b7280;text-decoration:none}.bc a:hover{color:var(--gold)}
    .bc span{margin:0 .35rem}

    /* hero */
    .hero{padding:3rem 0 2rem;text-align:center}
    .eyebrow{font-family:'Cinzel',serif;font-size:.68rem;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--purple);margin-bottom:.9rem}
    .hero h1{font-family:'Cinzel',serif;font-size:clamp(1.7rem,5vw,2.6rem);font-weight:900;color:var(--gold);letter-spacing:.03em;line-height:1.15;margin-bottom:.9rem}
    .hero-sub{font-size:1.05rem;color:#9ca3af;max-width:520px;margin:0 auto 1.75rem;line-height:1.7}
    .stats{display:flex;gap:1.25rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.75rem}
    .stat{background:var(--panel);border:1px solid var(--border);border-radius:2rem;padding:.55rem 1.2rem;display:flex;flex-direction:column;align-items:center;gap:.05rem}
    .stat-n{font-family:'Cinzel',serif;font-size:1.35rem;font-weight:900;color:var(--gold)}
    .stat-l{font-size:.68rem;text-transform:uppercase;letter-spacing:.15em;color:var(--muted)}

    /* section */
    .sec{margin-bottom:3rem}
    .sec-title{font-family:'Cinzel',serif;font-size:1rem;font-weight:700;color:#d1d5db;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:.7rem;margin-bottom:1.25rem}

    /* venue grid */
    .vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:.9rem}
    .vcard{background:var(--panel);border:1px solid var(--border);border-radius:.9rem;padding:1.15rem;transition:border-color .2s}
    .vcard:hover{border-color:#374151}
    .vcard-h{display:flex;align-items:center;gap:.7rem;margin-bottom:.6rem}
    .vemoji{font-size:1.65rem}
    .vname{font-family:'Cinzel',serif;font-size:.9rem;font-weight:700;color:#f3f4f6}
    .vdesc{font-size:.78rem;color:var(--muted)}
    .vcount{font-size:.82rem;color:var(--gold);font-family:'Cinzel',serif;font-weight:700;margin:.45rem 0 .65rem}
    .vsamples{list-style:none;display:flex;flex-direction:column;gap:.2rem}
    .vsamples li{font-size:.78rem;color:#9ca3af;display:flex;align-items:baseline;gap:.35rem}
    .vsamples li::before{content:'⚔';font-size:.58rem;color:#4b5563}

    /* quest grid */
    .qgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(278px,1fr));gap:.9rem}
    .qcard{background:var(--panel);border:1px solid;border-radius:.9rem;padding:1.15rem;display:flex;flex-direction:column;gap:.45rem}
    .qcard-head{display:flex;justify-content:space-between;align-items:center}
    .qcat{font-size:.62rem;font-family:'Cinzel',serif;letter-spacing:.15em;text-transform:uppercase;border:1px solid;border-radius:999px;padding:.12rem .55rem}
    .qxp{font-family:'Cinzel',serif;font-size:.72rem;font-weight:700;color:var(--gold)}
    .qtitle{font-family:'Cinzel',serif;font-size:.95rem;font-weight:700;color:#f3f4f6}
    .qdesc{font-size:.85rem;color:#9ca3af;line-height:1.5;flex:1}
    .qrarity{font-size:.62rem;text-transform:uppercase;letter-spacing:.15em;font-family:'Cinzel',serif}

    /* footer */
    .ftr{border-top:1px solid var(--border);padding:1.75rem 0;text-align:center;color:var(--muted);font-size:.78rem}
    .ftr a{color:var(--gold);text-decoration:none}.ftr a:hover{text-decoration:underline}
  </style>
</head>
<body>

  <header class="hdr">
    <div class="wrap">
      <div class="hdr-inner">
        <a class="logo" href="/">
          <div class="logo-icon">⚔️</div>
          <span class="logo-name">NightQuest</span>
        </a>
        <a class="btn" href="/">Play Free →</a>
      </div>
    </div>
  </header>

  <div class="wrap">
    <nav class="bc" aria-label="Breadcrumb">
      <a href="/">Home</a><span>›</span>
      <strong style="color:#d1d5db">Quest Library</strong>
    </nav>

    <div class="hero">
      <p class="eyebrow">NightQuest · Mission Library</p>
      <h1>Every Quest in the Game</h1>
      <p class="hero-sub">
        From bar-night icebreakers to 10-player open-mic squads — the full library of
        nightlife missions waiting for your crew.
      </p>
      <div class="stats">
        <div class="stat">
          <span class="stat-n">${total.toLocaleString()}+</span>
          <span class="stat-l">Total Quests</span>
        </div>
        <div class="stat">
          <span class="stat-n">5</span>
          <span class="stat-l">Venue Types</span>
        </div>
        <div class="stat">
          <span class="stat-n">3</span>
          <span class="stat-l">Difficulty Tiers</span>
        </div>
        <div class="stat">
          <span class="stat-n">2–10</span>
          <span class="stat-l">Squad Sizes</span>
        </div>
      </div>
      <a class="btn" href="/">Start Playing — Free</a>
    </div>

    <section class="sec">
      <h2 class="sec-title">Quests by Venue</h2>
      <div class="vgrid">
        ${venueBreakdown.map(v => `<div class="vcard">
          <div class="vcard-h">
            <span class="vemoji">${v.emoji}</span>
            <div>
              <div class="vname">${esc(v.label)}</div>
              <div class="vdesc">${esc(v.desc)}</div>
            </div>
          </div>
          <div class="vcount">${v.total.toLocaleString()} quests</div>
          <ul class="vsamples" aria-label="Sample quest titles">
            ${v.samples.map(t => `<li>${esc(t)}</li>`).join('\n            ')}
          </ul>
        </div>`).join('\n        ')}
      </div>
    </section>

    <section class="sec">
      <h2 class="sec-title">Featured Party Quests</h2>
      <p style="color:#6b7280;font-size:.88rem;margin-bottom:1.1rem">
        The original ${partyCount} NightQuest party challenges — earn XP completing these solo or with anyone, anywhere.
      </p>
      <div class="qgrid">
        ${QUESTS.map(q => questCard(q)).join('')}
      </div>
    </section>

    <section class="sec" style="text-align:center;padding:1.5rem 0 2rem">
      <h2 class="sec-title" style="border:none;text-align:center">Ready to Play?</h2>
      <p style="color:#9ca3af;margin:.75rem auto 1.5rem;max-width:400px;line-height:1.7">
        No account. No signup. Your data stays on your device.
        Open NightQuest and start your first quest in under 10 seconds.
      </p>
      <a class="btn" href="/">Open NightQuest →</a>
    </section>
  </div>

  <footer class="ftr">
    <div class="wrap">
      <p><a href="/">NightQuest</a> · Conquer the Night · ${total.toLocaleString()}+ quests · Free to play</p>
    </div>
  </footer>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "NightQuest Party Challenges",
    "description": "RPG-style nightlife quests for completing on a night out with friends",
    "url": "${SITE_URL}/quests",
    "numberOfItems": ${partyCount},
    "itemListElement": ${JSON.stringify(jsonLdItems, null, 4)}
  }
  </script>

</body>
</html>`

// ── 8. Write output: /quests page ────────────────────────────────────────────
mkdirSync(join(root, 'public/quests'), { recursive: true })
writeFileSync(join(root, 'public/quests/index.html'), html.trim() + '\n')

// ── 9. Regenerate sitemap.xml with current SITE_URL ──────────────────────────
const today = new Date().toISOString().slice(0, 10)
const sitemapEntries = [
  { path: '/',              priority: '1.0',  freq: 'weekly'  },
  { path: '/quests',        priority: '0.95', freq: 'monthly' },
  { path: '/?tab=quests',   priority: '0.9',  freq: 'weekly'  },
  { path: '/?tab=squad',    priority: '0.85', freq: 'weekly'  },
  { path: '/?tab=plan',     priority: '0.9',  freq: 'weekly'  },
  { path: '/?tab=nights',   priority: '0.8',  freq: 'weekly'  },
  { path: '/privacy',       priority: '0.3',  freq: 'yearly'  },
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(e => `
  <url>
    <loc>${SITE_URL}${e.path}</loc>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>
`
writeFileSync(join(root, 'public/sitemap.xml'), sitemap)

// ── Regenerate robots.txt so its Sitemap line matches SITE_URL ──────────────
const robots = `User-agent: *
Allow: /

# Block service worker and build artefacts from indexing
Disallow: /sw.js
Disallow: /assets/

Sitemap: ${SITE_URL}/sitemap.xml
`
writeFileSync(join(root, 'public/robots.txt'), robots)

// ── 10. Patch index.html OG tags so they reflect the current SITE_URL ───────
const indexPath = join(root, 'index.html')
const indexSrc  = readFileSync(indexPath, 'utf-8')
// Replace any existing URL in the og:url / og:image / twitter:image tags only
const patched = indexSrc
  .replace(/(<meta property="og:url"\s+content=")[^"]+(")/i,        `$1${SITE_URL}/$2`)
  .replace(/(<meta property="og:image"\s+content=")[^"]+(")/i,      `$1${SITE_URL}/og-image.png$2`)
  .replace(/(<meta name="twitter:image"\s+content=")[^"]+(")/i,    `$1${SITE_URL}/og-image.png$2`)
if (patched !== indexSrc) {
  writeFileSync(indexPath, patched)
  console.log(`✓  index.html               OG/Twitter meta tags updated`)
}

// ── 11. Patch privacy.html canonical URL with current SITE_URL ───────────────
const privacyPath = join(root, 'public/privacy.html')
try {
  const privacySrc = readFileSync(privacyPath, 'utf-8')
  const privacyPatched = privacySrc
    .replace(/(<link rel="canonical"\s+href=")[^"]+(")/i, `$1${SITE_URL}/privacy$2`)
  if (privacyPatched !== privacySrc) {
    writeFileSync(privacyPath, privacyPatched)
    console.log(`✓  public/privacy.html        canonical updated`)
  }
} catch { /* privacy.html optional */ }

const breakdown = OUTING_TYPES.map(o => `${o.label}: ${countByVenue[o.id].toLocaleString()}`).join('  |  ')
console.log(`✓  public/quests/index.html  generated   (SITE_URL: ${SITE_URL})`)
console.log(`✓  public/sitemap.xml         regenerated`)
console.log(`✓  public/robots.txt          regenerated`)
console.log(`   Party: ${partyCount}  |  ${breakdown}`)
console.log(`   Total: ${total.toLocaleString()}`)
