const CACHE = 'nq-v1'

// On install: cache the app shell
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(['/', '/index.html']))
  )
})

// On activate: remove old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch: stale-while-revalidate
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  // Skip cross-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request)
      const networkFetch = fetch(e.request)
        .then(res => {
          // Cache valid responses
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(e.request, res.clone())
          }
          return res
        })
        .catch(() => cached)  // fall back to cache on network failure

      // Return cached immediately (if available), update in background
      return cached || networkFetch
    })
  )
})

// Handle messages from the app
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
