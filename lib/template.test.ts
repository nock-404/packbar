import { describe, expect, test } from 'vitest'
import { templateToRows, contentToRows, filterTemplate, type TemplateCategory } from './template'
import { defaultTemplate } from './default-template'

const LIST_ID = '00000000-0000-0000-0000-000000000001'

const mini: TemplateCategory[] = [
	{
		name: 'Hygiene',
		items: [{ name: 'Handtuch' }],
		children: [
			{ name: 'Zahnpflege', items: [{ name: 'Zahnbürste', lastMinute: true }, { name: 'Zahnpasta', quantity: 2 }] },
		],
	},
	{ name: 'Technik', items: [{ name: 'Powerbank', note: 'vorher laden' }] },
]

describe('templateToRows', () => {
	test('erzeugt Kategorien mit parent-Verknüpfung und Items mit sort_order', () => {
		const rows = templateToRows(LIST_ID, mini)
		expect(rows.categories).toHaveLength(3)
		const hygiene = rows.categories.find(c => c.name === 'Hygiene')!
		const zahnpflege = rows.categories.find(c => c.name === 'Zahnpflege')!
		expect(hygiene.parentId ?? null).toBeNull()
		expect(zahnpflege.parentId).toBe(hygiene.id)
		expect(rows.categories.map(c => c.listId)).toEqual([LIST_ID, LIST_ID, LIST_ID])
		expect(rows.items).toHaveLength(4)
		const zb = rows.items.find(i => i.name === 'Zahnbürste')!
		expect(zb.categoryId).toBe(zahnpflege.id)
		expect(zb.lastMinute).toBe(true)
		const zp = rows.items.find(i => i.name === 'Zahnpasta')!
		expect(zp.quantity).toBe(2)
		expect(zp.sortOrder).toBeGreaterThan(zb.sortOrder!)
		expect(rows.persons).toEqual([])
	})
})

describe('contentToRows', () => {
	test('kopiert tief, setzt Haken zurück, mappt Personen', () => {
		const source = {
			persons: [{ id: 'p1', name: 'Matteo', sortOrder: 0 }],
			categories: [
				{
					id: 'c1', name: 'Kleidung', sortOrder: 0,
					items: [{ id: 'i1', name: 'Socken', quantity: 5, note: null, lastMinute: false, packed: true, personId: 'p1', sortOrder: 0 }],
					children: [
						{ id: 'c2', name: 'Oberteile', sortOrder: 0, items: [{ id: 'i2', name: 'Shirts', quantity: null, note: null, lastMinute: false, packed: true, personId: null, sortOrder: 0 }] },
					],
				},
			],
		}
		const rows = contentToRows(LIST_ID, source as never, { resetPacked: true, includePersons: true })
		expect(rows.persons).toHaveLength(1)
		expect(rows.persons[0].id).not.toBe('p1')
		const socken = rows.items.find(i => i.name === 'Socken')!
		expect(socken.packed).toBe(false)
		expect(socken.personId).toBe(rows.persons[0].id)
		expect(rows.categories).toHaveLength(2)
		const kinder = rows.categories.find(c => c.name === 'Oberteile')!
		expect(kinder.parentId).toBe(rows.categories.find(c => c.name === 'Kleidung')!.id)
	})
	test('ohne Personen wird personId null', () => {
		const source = {
			persons: [{ id: 'p1', name: 'Matteo', sortOrder: 0 }],
			categories: [
				{ id: 'c1', name: 'K', sortOrder: 0, items: [{ id: 'i1', name: 'X', quantity: null, note: null, lastMinute: false, packed: false, personId: 'p1', sortOrder: 0 }], children: [] },
			],
		}
		const rows = contentToRows(LIST_ID, source as never, { resetPacked: false, includePersons: false })
		expect(rows.persons).toEqual([])
		expect(rows.items[0].personId ?? null).toBeNull()
	})
})

describe('filterTemplate', () => {
	const template: TemplateCategory[] = [
		{ name: 'Dokumente & Papiere', items: [{ name: 'Reisepass' }] },
		{ name: 'Geld & Finanzen', items: [{ name: 'Bargeld' }] },
		{
			name: 'Kleidung',
			items: [],
			children: [{ name: 'Oberteile', items: [{ name: 'T-Shirts' }] }],
		},
		{ name: 'Schuhe', items: [{ name: 'Sneaker' }] },
	]

	test('behaelt nur die gewaehlten Hauptkategorien, in Original-Reihenfolge', () => {
		const result = filterTemplate(template, ['Schuhe', 'Dokumente & Papiere'])
		expect(result.map(c => c.name)).toEqual(['Dokumente & Papiere', 'Schuhe'])
	})

	test('nimmt Unterkategorien einer gewaehlten Hauptkategorie automatisch mit', () => {
		const result = filterTemplate(template, ['Kleidung'])
		expect(result).toHaveLength(1)
		expect(result[0].children?.map(c => c.name)).toEqual(['Oberteile'])
	})

	test('leere Auswahl ergibt leeres Template', () => {
		expect(filterTemplate(template, [])).toEqual([])
	})

	test('unbekannte Namen werden ignoriert', () => {
		const result = filterTemplate(template, ['Nicht vorhanden'])
		expect(result).toEqual([])
	})

	test('veraendert das Original-Template nicht', () => {
		filterTemplate(template, ['Schuhe'])
		expect(template).toHaveLength(4)
	})
})

describe('defaultTemplate', () => {
	test('keine doppelten Item-Namen über die gesamte Vorlage', () => {
		const names = defaultTemplate.flatMap(c => [
			...c.items.map(i => i.name),
			...(c.children ?? []).flatMap(s => s.items.map(i => i.name)),
		])
		const dupes = names.filter((n, idx) => names.indexOf(n) !== idx)
		expect(dupes).toEqual([])
	})
	test('keine doppelten Kategorienamen', () => {
		const names = defaultTemplate.map(c => c.name)
		expect(new Set(names).size).toBe(names.length)
	})
	test('hat Last-Minute-Einträge', () => {
		const lastMinute = defaultTemplate.flatMap(c => [
			...c.items, ...(c.children ?? []).flatMap(s => s.items),
		]).filter(i => i.lastMinute)
		expect(lastMinute.length).toBeGreaterThanOrEqual(8)
	})
})
