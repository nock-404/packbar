import { NextResponse } from 'next/server'
import { daysUntil } from '@/lib/dates'
import { codeToCondition, type WeatherCondition } from '@/lib/weather'

const FORECAST_HORIZON_DAYS = 16
const CACHE_TTL_MS = 30 * 60 * 1000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

type WeatherResult =
	| { available: false }
	| {
			available: true
			condition: WeatherCondition
			temperatureMin: number
			temperatureMax: number
			precipitationProbabilityMax: number
	  }

type CacheEntry = {
	value: WeatherResult
	expiresAt: number
}

const cache = new Map<string, CacheEntry>()

type GeocodingResponse = {
	results?: { latitude: number; longitude: number }[]
}

type ForecastResponse = {
	daily?: {
		weather_code: number[]
		temperature_2m_max: number[]
		temperature_2m_min: number[]
		precipitation_probability_max: number[]
	}
}

const conditionSeverity: Record<WeatherCondition, number> = {
	sun: 0,
	cloud: 1,
	rain: 2,
	snow: 3,
	storm: 4,
}

function toDateString(date: Date): string {
	return date.toISOString().slice(0, 10)
}

function clampEndDate(to: string): string {
	const today = new Date()
	const maxDate = new Date(
		Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + FORECAST_HORIZON_DAYS),
	)
	const maxDateString = toDateString(maxDate)
	return to > maxDateString ? maxDateString : to
}

async function geocode(destination: string): Promise<{ latitude: number; longitude: number } | null> {
	const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=de`
	const response = await fetch(url)
	if (!response.ok) return null
	const data = (await response.json()) as GeocodingResponse
	const first = data.results?.[0]
	if (!first) return null
	return { latitude: first.latitude, longitude: first.longitude }
}

async function fetchForecast(
	latitude: number,
	longitude: number,
	from: string,
	to: string,
): Promise<ForecastResponse | null> {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&start_date=${from}&end_date=${to}&timezone=auto`
	const response = await fetch(url)
	if (!response.ok) return null
	return (await response.json()) as ForecastResponse
}

function respond(cacheKey: string | null, result: WeatherResult) {
	if (cacheKey) {
		cache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS })
	}
	return NextResponse.json(result)
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const destination = searchParams.get('destination')?.trim()
		const from = searchParams.get('from')?.trim()
		const to = searchParams.get('to')?.trim() || from

		if (!destination || !from || !to || !DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
			return respond(null, { available: false })
		}

		const cacheKey = `${destination.toLowerCase()}|${from}|${to}`
		const cached = cache.get(cacheKey)
		if (cached && cached.expiresAt > Date.now()) {
			return NextResponse.json(cached.value)
		}

		const startOffset = daysUntil(from)
		if (startOffset < 0 || startOffset > FORECAST_HORIZON_DAYS) {
			return respond(cacheKey, { available: false })
		}

		const location = await geocode(destination)
		if (!location) {
			return respond(cacheKey, { available: false })
		}

		const effectiveTo = clampEndDate(to)
		const forecast = await fetchForecast(location.latitude, location.longitude, from, effectiveTo)
		const daily = forecast?.daily
		if (!daily || daily.weather_code.length === 0) {
			return respond(cacheKey, { available: false })
		}

		const temperatureMin = Math.min(...daily.temperature_2m_min)
		const temperatureMax = Math.max(...daily.temperature_2m_max)
		const precipitationProbabilityMax = Math.max(...daily.precipitation_probability_max)
		const condition = daily.weather_code.map(codeToCondition).reduce(
			(worst, current) => (conditionSeverity[current] > conditionSeverity[worst] ? current : worst),
			'sun' as WeatherCondition,
		)

		return respond(cacheKey, {
			available: true,
			condition,
			temperatureMin,
			temperatureMax,
			precipitationProbabilityMax,
		})
	} catch {
		return NextResponse.json({ available: false })
	}
}
