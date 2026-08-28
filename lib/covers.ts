export interface Cover {
	id: string
	file: string
	label: string
	credit: { name: string; url: string }
}

export const covers: Cover[] = [
	{
		id: 'gepaeck-mann',
		file: 'gepaeck-mann.jpg',
		label: 'Aufbruch',
		credit: { name: 'Mantas Hesthaven', url: 'https://unsplash.com/@mantashesthaven' },
	},
	{
		id: 'koffer-stapel-bunt',
		file: 'koffer-stapel-bunt.jpg',
		label: 'Kofferstapel',
		credit: { name: 'Erwan Hesry', url: 'https://unsplash.com/@erwanhesry' },
	},
	{
		id: 'koffer-offen',
		file: 'koffer-offen.jpg',
		label: 'Gepackter Koffer',
		credit: { name: 'Marissa Grootes', url: 'https://unsplash.com/@marissacristina' },
	},
	{
		id: 'kamera-tasche',
		file: 'kamera-tasche.jpg',
		label: 'Reiseausrüstung',
		credit: { name: 'Anete Lūsiņa', url: 'https://unsplash.com/@anete_lusina' },
	},
	{
		id: 'gepaeck-stapel',
		file: 'gepaeck-stapel.jpg',
		label: 'Gepäckberge',
		credit: { name: 'Caroline Selfors', url: 'https://unsplash.com/@cselfors' },
	},
	{
		id: 'flughafen',
		file: 'flughafen.jpg',
		label: 'Flughafen',
		credit: { name: 'Niklas Jonasson', url: 'https://unsplash.com/@niklasjonasson' },
	},
	{
		id: 'reisepass',
		file: 'reisepass.jpg',
		label: 'Reisepass',
		credit: { name: 'Blake Guidry', url: 'https://unsplash.com/@blakeguidry' },
	},
	{
		id: 'rucksack',
		file: 'rucksack.jpg',
		label: 'Rucksack',
		credit: { name: 'Adam Hornyak', url: 'https://unsplash.com/@adamhornyak' },
	},
	{
		id: 'adria',
		file: 'adria.jpg',
		label: 'Adria-Bucht',
		credit: { name: 'Ammar Sabanovic', url: 'https://unsplash.com/@ammarsab' },
	},
	{
		id: 'winter',
		file: 'winter.jpg',
		label: 'Winter',
		credit: { name: 'Denis Linine', url: 'https://unsplash.com/@denislinine' },
	},
	{
		id: 'strand',
		file: 'strand.jpg',
		label: 'Strand',
		credit: { name: 'Elizeu Dias', url: 'https://unsplash.com/@elishavision' },
	},
	{
		id: 'berge',
		file: 'berge.jpg',
		label: 'Berge',
		credit: { name: 'Florian Schönbrunner', url: 'https://unsplash.com/@ferdinand8a' },
	},
	{
		id: 'roadtrip',
		file: 'roadtrip.jpg',
		label: 'Roadtrip',
		credit: { name: 'Devin Avery', url: 'https://unsplash.com/@devintavery' },
	},
	{
		id: 'camping',
		file: 'camping.jpg',
		label: 'Camping',
		credit: { name: 'Dino Reichmuth', url: 'https://unsplash.com/@dinoreichmuth' },
	},
	{
		id: 'stadt',
		file: 'stadt.jpg',
		label: 'Städtetrip',
		credit: { name: 'Luca Bravo', url: 'https://unsplash.com/@lucabravo' },
	},
]

export const gradientCovers = [
	{ id: 'gradient:teal', label: 'Petrol' },
	{ id: 'gradient:amber', label: 'Amber' },
	{ id: 'gradient:night', label: 'Nacht' },
]

export function coverUrl(id: string): string | null {
	if (id.startsWith('custom:')) return `/api/uploads/${id.slice('custom:'.length)}`
	const cover = covers.find(c => c.id === id)
	return cover ? `/covers/${cover.file}` : null
}

export function isCustomCoverId(id: string): boolean {
	return id.startsWith('custom:')
}

export const gradientClass: Record<string, string> = {
	'gradient:teal': 'from-primary to-primary-strong',
	'gradient:amber': 'from-accent to-accent-strong',
	'gradient:night': 'from-ink to-ink-muted',
}

export function randomCoverId(): string {
	return covers[Math.floor(Math.random() * covers.length)].id
}

export function fallbackCoverId(seed: string): string {
	let hash = 0
	for (let index = 0; index < seed.length; index += 1) {
		hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
	}
	return covers[hash % covers.length].id
}

export function resolveCoverId(coverImage: string | null, seed: string): string {
	return coverImage ?? fallbackCoverId(seed)
}
