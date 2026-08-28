import type { useFormatter } from 'next-intl'

type Formatter = ReturnType<typeof useFormatter>

export function toUtcDate(dateString: string): Date {
	const [year, month, day] = dateString.split('-').map(Number)
	return new Date(Date.UTC(year, month - 1, day))
}

export function destinationCode(destination: string): string {
	return destination.slice(0, 3).toUpperCase()
}

export function formatTripRange(format: Formatter, tripDate: string, tripEnd: string | null): string {
	const start = toUtcDate(tripDate)
	const full = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' } as const
	if (!tripEnd) return format.dateTime(start, full)
	const end = toUtcDate(tripEnd)
	const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
	const startLabel = format.dateTime(start, sameYear ? { day: '2-digit', month: '2-digit', timeZone: 'UTC' } : full)
	return `${startLabel} - ${format.dateTime(end, full)}`
}
