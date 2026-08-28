const CACHE_VERSION = 'v1'
const NAV_CACHE = `packbar-nav-${CACHE_VERSION}`
const STATIC_CACHE = `packbar-static-${CACHE_VERSION}`
const CURRENT_CACHES = [NAV_CACHE, STATIC_CACHE]

const OFFLINE_HTML = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>packbar – offline</title>
<style>
	html, body {
		margin: 0;
		padding: 0;
		height: 100%;
		background: #14171a;
		color: #f4f2ec;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}
	body {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem;
	}
	p {
		max-width: 28rem;
		font-size: 1.125rem;
		line-height: 1.6;
	}
</style>
</head>
<body>
	<p>packbar ist gerade offline. Sobald du wieder Netz hast, geht es weiter.</p>
</body>
</html>`

function offlineResponse() {
	return new Response(OFFLINE_HTML, {
		status: 200,
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	})
}

self.addEventListener('install', () => {
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys()
			await Promise.all(
				names
					.filter((name) => !CURRENT_CACHES.includes(name))
					.map((name) => caches.delete(name)),
			)
			await self.clients.claim()
		})(),
	)
})

function isStaticAsset(url) {
	return (
		url.pathname.startsWith('/_next/static/')
		|| url.pathname.startsWith('/covers/')
		|| url.pathname.match(/\.(woff2?|ttf|otf)$/)
	)
}

async function networkFirstNavigation(request) {
	try {
		const response = await fetch(request)
		const cache = await caches.open(NAV_CACHE)
		cache.put(request, response.clone())
		return response
	} catch {
		const cache = await caches.open(NAV_CACHE)
		const cached = await cache.match(request)
		if (cached) {
			return cached
		}
		return offlineResponse()
	}
}

async function staleWhileRevalidate(request) {
	const cache = await caches.open(STATIC_CACHE)
	const cached = await cache.match(request)
	const networkFetch = fetch(request)
		.then((response) => {
			cache.put(request, response.clone())
			return response
		})
		.catch(() => cached)
	return cached || networkFetch
}

self.addEventListener('fetch', (event) => {
	const { request } = event
	if (request.method !== 'GET') {
		return
	}

	const url = new URL(request.url)
	if (url.origin !== self.location.origin) {
		return
	}

	if (url.pathname.startsWith('/api/')) {
		event.respondWith(fetch(request))
		return
	}

	if (request.mode === 'navigate') {
		event.respondWith(networkFirstNavigation(request))
		return
	}

	if (isStaticAsset(url)) {
		event.respondWith(staleWhileRevalidate(request))
	}
})
