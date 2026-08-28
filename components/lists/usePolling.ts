'use client'

import { useEffect, useRef } from 'react'
import type { ListWithContent } from '@/lib/dal/tree'

type UsePollingOptions = {
	fetcher: () => Promise<ListWithContent | null>
	enabled: boolean
	onResult: (list: ListWithContent) => void
	isPaused?: () => boolean
	intervalMs?: number
}

export function usePolling({ fetcher, enabled, onResult, isPaused, intervalMs = 5000 }: UsePollingOptions): void {
	const fetcherRef = useRef(fetcher)
	const onResultRef = useRef(onResult)
	const isPausedRef = useRef(isPaused)

	useEffect(() => {
		fetcherRef.current = fetcher
		onResultRef.current = onResult
		isPausedRef.current = isPaused
	}, [fetcher, onResult, isPaused])

	useEffect(() => {
		if (!enabled) return

		let cancelled = false

		const tick = async () => {
			if (document.visibilityState !== 'visible') return
			if (isPausedRef.current?.()) return
			const result = await fetcherRef.current()
			if (!cancelled && result) onResultRef.current(result)
		}

		const interval = setInterval(() => {
			void tick()
		}, intervalMs)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [enabled, intervalMs])
}
