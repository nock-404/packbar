const MS_PER_DAY = 1000 * 60 * 60 * 24

export function daysUntil(dateString: string): number {
	const [year, month, day] = dateString.split('-').map(Number)
	const target = Date.UTC(year, month - 1, day)

	const now = new Date()
	const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())

	return Math.round((target - today) / MS_PER_DAY)
}
