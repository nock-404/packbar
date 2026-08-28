import { defaultTemplate } from './default-template'

export interface TemplatePreset {
	id: string
	categories: string[]
}

const DOKUMENTE = 'Dokumente & Papiere'
const GELD = 'Geld & Finanzen'
const KLEIDUNG = 'Kleidung'
const SCHUHE = 'Schuhe'
const HYGIENE = 'Hygiene'
const MEDIKAMENTE = 'Medikamente & Apotheke'
const TECHNIK = 'Technik'
const STRAND = 'Strand & Baden'
const CAMPING = 'Camping & Outdoor'
const KUECHE = 'Küche & Proviant'
const AUTO = 'Auto & Unterwegs'
const KINDER = 'Kinder'
const HAUSTIER = 'Haustier'
const TASCHEN = 'Taschen & Gepäck'
const SONSTIGES = 'Sonstiges'

const KERN = [DOKUMENTE, GELD, KLEIDUNG, SCHUHE, HYGIENE, MEDIKAMENTE, TECHNIK]

export const basisSelection: string[] = [...KERN, TASCHEN, SONSTIGES]

const staedtetripCategories = basisSelection
const roadtripCategories = [...KERN, KUECHE, AUTO, TASCHEN, SONSTIGES]

export const templatePresets: TemplatePreset[] = [
	{ id: 'strand', categories: [...KERN, STRAND, TASCHEN, SONSTIGES] },
	{ id: 'roadtrip', categories: roadtripCategories },
	{ id: 'camping', categories: [...roadtripCategories, CAMPING, STRAND] },
	{ id: 'staedtetrip', categories: staedtetripCategories },
	{ id: 'winter', categories: staedtetripCategories },
	{ id: 'kinder', categories: [KINDER] },
	{ id: 'haustier', categories: [HAUSTIER] },
	{ id: 'alles', categories: defaultTemplate.map(category => category.name) },
]

export function unionCategories(presetIds: Iterable<string>): string[] {
	const result = new Set<string>()
	for (const id of presetIds) {
		const preset = templatePresets.find(candidate => candidate.id === id)
		if (preset) preset.categories.forEach(name => result.add(name))
	}
	return Array.from(result)
}
