import type { MetadataRoute } from 'next'
import messages from '@/messages/de.json'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: messages.common.appName,
		short_name: messages.common.appName,
		description: messages.manifest.description,
		start_url: '/dashboard',
		display: 'standalone',
		background_color: '#faf7f0',
		theme_color: '#00717c',
		icons: [
			{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
			{ src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
			{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
			{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
			{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
		],
	}
}
