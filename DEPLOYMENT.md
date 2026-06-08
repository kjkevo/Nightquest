# NightQuest — Deployment Guide

Fixes the **Production Checklist** items flagged in the Vercel dashboard.
Most steps below require the **Vercel project owner** to act in the dashboard;
the code-side work has already been done.

---

## 🟢 Code-side fixes (already shipped)

| # | Item | How it's solved in code |
|---|---|---|
| 23 | Security & caching headers | `vercel.json` now adds `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `max-age=31536000 immutable` on `/assets/*` and images, `must-revalidate` on `sw.js`, `s-maxage=3600 SWR` on `/quests`. |
| 24 | Analytics + Speed Insights | `@vercel/analytics` and `@vercel/speed-insights` installed and wired in `src/main.jsx`. Auto-disabled in dev. |
| 25 | Crawler-readable screenshot | `public/quests/index.html` is generated at build time with full quest content. Vercel's screenshot bot and Googlebot can both see the content without running JS. |
| 22 (prep) | Domain-portable URLs | Set `SITE_URL` env var in Vercel and the next build regenerates `/sitemap.xml`, `/quests/index.html`, and patches `index.html` OG tags. No source changes needed when domain changes. |

---

## 🟡 Vercel dashboard actions you need to take

### #20 — Production Checklist (5/5)

Go to **Project → Settings** and complete each item. They map to #21, #22 below and these three:

- **Preview Deployments**: Settings → Git → enable "Create preview comments". On by default once Git is connected.
- **Deployment Protection**: Settings → Deployment Protection → set "Vercel Authentication" or "Password Protection" on preview deploys so unfinished work isn't publicly indexed.
- **Monitoring**: Settings → Monitoring → enable Web Vitals + Audit Logs.

### #21 — Connect Git repository

```bash
# 1. Push the local repo to GitHub
gh repo create nightquest --private --source=. --remote=origin
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. Connect in Vercel
# Vercel dashboard → Project Settings → Git → "Connect Git Repository"
# Select the nightquest repo. Vercel will auto-build on every push to main.
```

After this, **delete the manual deployment from `vercel deploy`** under
Settings → General → Production Branch, and let Git pushes drive deploys.

### #22 — Custom domain

```
1. Register the domain (e.g. nightquest.app on Cloudflare/Namecheap)
2. Vercel Dashboard → Project → Settings → Domains → Add
   - Add both: nightquest.app  AND  www.nightquest.app
3. Vercel will give you DNS records — add them at your registrar
4. Once verified, set the production env var:

   Settings → Environment Variables:
     SITE_URL = https://nightquest.app
     (Environment: Production)

5. Redeploy. The build script will rewrite:
   - /sitemap.xml         → all URLs to nightquest.app
   - /quests/index.html   → canonical + OG tags to nightquest.app
   - /index.html          → OG/Twitter image URLs to nightquest.app
```

### #23 — Review Deployment Settings recommendations

`vercel.json` already implements the typical fixes (CSP-adjacent headers + asset
caching). Open Settings → Recommendations and mark them as complete — verify
each by checking response headers on a deployed URL with `curl -I`.

### #24 — Verify analytics show up

After the next deploy:
- Visit the live site in a private window.
- Vercel → Project → **Analytics** tab should show 1+ visit within 60s.
- Vercel → Project → **Speed Insights** tab will fill in as real visits arrive.

If you see nothing after a deploy + visit, double-check that
`src/main.jsx` still wraps `<App />` with `<Analytics />` and `<SpeedInsights />`.

### #25 — Re-generate preview screenshot

Once #22 is done and you've redeployed, trigger a new build. Vercel's
screenshot bot will rescan the static `/quests` page (and the new root
`index.html` which has the splash CTA). The "no screenshot" warning should
clear within ~10 minutes.

---

## Local dev

```bash
npm install
npm run dev        # localhost:5173
npm run build      # regenerates /quests, /sitemap.xml, then runs Vite
npm run preview    # serve the production build
```

To preview with a different SITE_URL locally:

```bash
SITE_URL=https://staging.nightquest.app npm run build && npm run preview
```
