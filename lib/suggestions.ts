const MS_PER_DAY = 1000 * 60 * 60 * 24

export function nightsBetween(from: string, to: string): number {
	const [fromYear, fromMonth, fromDay] = from.split('-').map(Number)
	const [toYear, toMonth, toDay] = to.split('-').map(Number)
	const fromUTC = Date.UTC(fromYear, fromMonth - 1, fromDay)
	const toUTC = Date.UTC(toYear, toMonth - 1, toDay)
	return Math.round((toUTC - fromUTC) / MS_PER_DAY)
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

export interface QuantitySuggestion {
	itemName: string
	quantity: number
}

export function suggestQuantities(nights: number): QuantitySuggestion[] {
	return [
		{ itemName: 'Unterwäsche', quantity: clamp(nights + 1, 0, 10) },
		{ itemName: 'Socken', quantity: clamp(nights + 1, 0, 10) },
		{ itemName: 'T-Shirts', quantity: clamp(Math.ceil(nights / 2) + 1, 0, 8) },
		{ itemName: 'Kurze Hosen', quantity: clamp(Math.ceil(nights / 4), 1, 3) },
		{ itemName: 'Lange Hosen', quantity: clamp(Math.ceil(nights / 4), 1, 3) },
		{ itemName: 'Schlafanzug', quantity: nights > 3 ? 2 : 1 },
	]
}
