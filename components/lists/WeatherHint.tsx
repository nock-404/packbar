'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbCloud, TbCloudRain, TbCloudStorm, TbSnowflake, TbSun } from 'react-icons/tb'
import { Badge } from '@/components/ui/Badge'
import type { WeatherCondition } from '@/lib/weather'

type WeatherHintProps = {
	destination: string | null
	tripDate: string | null
	tripEnd?: string | null
}

type WeatherApiResponse =
	| { available: false }
	| {
			available: true
			condition: WeatherCondition
			temperatureMin: number
			temperatureMax: number
			precipitationProbabilityMax: number
	  }

const RAIN_PROBABILITY_THRESHOLD = 40

const conditionIcons: Record<WeatherCondition, typeof TbSun> = {
	sun: TbSun,
	cloud: TbCloud,
	rain: TbCloudRain,
	snow: TbSnowflake,
	storm: TbCloudStorm,
}

type WeatherLoadResult = {
	key: string
	data: WeatherApiResponse
}

export function WeatherHint({ destination, tripDate, tripEnd }: WeatherHintProps) {
	const t = useTranslations('weather')
	const requestKey = destination && tripDate ? `${destination}|${tripDate}|${tripEnd ?? ''}` : null
	const [result, setResult] = useState<WeatherLoadResult | null>(null)

	useEffect(() => {
		if (!requestKey || !destination || !tripDate) return

		const controller = new AbortController()
		const params = new URLSearchParams({ destination, from: tripDate })
		if (tripEnd) params.set('to', tripEnd)

		fetch(`/api/weather?${params.toString()}`, { signal: controller.signal })
			.then(response => response.json())
			.then((data: WeatherApiResponse) => {
				setResult({ key: requestKey, data })
			})
			.catch(() => {
				if (controller.signal.aborted) return
				setResult({ key: requestKey, data: { available: false } })
			})

		return () => controller.abort()
	}, [requestKey, destination, tripDate, tripEnd])

	if (!destination || !tripDate) return null

	if (!result || result.key !== requestKey) {
		return (
			<div className="flex items-center gap-1.5 animate-pulse" aria-hidden="true">
				<div className="size-4 rounded-full bg-surface-sunken" />
				<div className="h-3 w-14 rounded-xs bg-surface-sunken" />
			</div>
		)
	}

	const data = result.data
	if (!data.available) return null

	const Icon = conditionIcons[data.condition]
	const showRainBadge = data.precipitationProbabilityMax >= RAIN_PROBABILITY_THRESHOLD

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
			<span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted tabular-nums">
				<Icon className="size-4" />
				{Math.round(data.temperatureMin)}° / {Math.round(data.temperatureMax)}°
			</span>
			{showRainBadge && (
				<span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
					<Badge tone="accent">{t('rainBadge')}</Badge>
					{t('rainHint')}
				</span>
			)}
		</div>
	)
}
