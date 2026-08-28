'use client'

import { useEffect } from 'react'
import { useOverlayScrollbars } from 'overlayscrollbars-react'

export function BodyScrollbars() {
	const [initialize] = useOverlayScrollbars({
		defer: true,
		options: { scrollbars: { autoHide: 'scroll', theme: 'os-theme-packbar' } },
	})

	useEffect(() => {
		initialize(document.body)
	}, [initialize])

	return null
}
