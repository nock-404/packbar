import { describe, expect, test } from 'vitest'
import { basisSelection, templatePresets, unionCategories } from './presets'
import { defaultTemplate } from './default-template'

describe('templatePresets', () => {
	test('kinder und haustier sind reine Zusatz-Sets', () => {
		expect(templatePresets.find(p => p.id === 'kinder')!.categories).toEqual(['Kinder'])
		expect(templatePresets.find(p => p.id === 'haustier')!.categories).toEqual(['Haustier'])
	})

	test('alles enthaelt alle Hauptkategorien der Vorlage', () => {
		const alles = templatePresets.find(p => p.id === 'alles')!
		expect(alles.categories.sort()).toEqual(defaultTemplate.map(c => c.name).sort())
	})

	test('basisSelection ist die Default-Vorauswahl ohne Strand/Camping/Kueche/Auto/Kinder/Haustier', () => {
		expect(basisSelection).toEqual([
			'Dokumente & Papiere',
			'Geld & Finanzen',
			'Kleidung',
			'Schuhe',
			'Hygiene',
			'Medikamente & Apotheke',
			'Technik',
			'Taschen & Gepäck',
			'Sonstiges',
		])
	})
})

describe('unionCategories', () => {
	test('bildet die Vereinigung mehrerer Presets', () => {
		const result = new Set(unionCategories(['camping', 'kinder']))
		expect(result.has('Camping & Outdoor')).toBe(true)
		expect(result.has('Kinder')).toBe(true)
		expect(result.has('Strand & Baden')).toBe(true)
	})

	test('dedupliziert ueberlappende Kategorien', () => {
		const result = unionCategories(['staedtetrip', 'winter'])
		const unique = new Set(result)
		expect(result.length).toBe(unique.size)
	})

	test('ignoriert unbekannte Preset-Ids', () => {
		expect(unionCategories(['nicht-vorhanden'])).toEqual([])
	})

	test('leere Eingabe ergibt leeres Ergebnis', () => {
		expect(unionCategories([])).toEqual([])
	})
})
