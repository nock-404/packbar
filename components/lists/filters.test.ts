import { describe, expect, test } from 'vitest'
import { applyFilters, countOpenLastMinute, emptyFilters, hasActiveFilters, type Filters } from './filters'
import type { ListWithContent, CategoryTree } from '@/lib/dal/tree'
import type { Item } from '@/lib/db/schema'

function makeItem(overrides: Partial<Item> = {}): Item {
	return {
		id: 'item-1',
		categoryId: 'cat-1',
		name: 'Sonnencreme',
		quantity: null,
		note: null,
		lastMinute: false,
		packed: false,
		personId: null,
		sortOrder: 0,
		...overrides,
	}
}

function makeCategory(overrides: Partial<CategoryTree> = {}): CategoryTree {
	return {
		id: 'cat-1',
		listId: 'list-1',
		parentId: null,
		name: 'Kleidung',
		sortOrder: 0,
		items: [],
		children: [],
		...overrides,
	}
}

function makeList(overrides: Partial<ListWithContent> = {}): ListWithContent {
	return {
		id: 'list-1',
		userId: 'user-1',
		name: 'Kroatien Roadtrip',
		coverImage: null,
		destination: 'Kroatien',
		tripDate: null,
		tripEnd: null,
		lastMinuteMailSentAt: null,
		shareToken: null,
		shareMode: 'off',
		isTemplate: false,
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		categories: [],
		persons: [],
		...overrides,
	}
}

describe('hasActiveFilters', () => {
	test('false wenn nichts aktiv ist', () => {
		expect(hasActiveFilters(emptyFilters)).toBe(false)
	})

	test('true sobald ein Filter aktiv ist', () => {
		expect(hasActiveFilters({ ...emptyFilters, hideDone: true })).toBe(true)
		expect(hasActiveFilters({ ...emptyFilters, lastMinuteOnly: true })).toBe(true)
		expect(hasActiveFilters({ ...emptyFilters, personId: 'p-1' })).toBe(true)
	})
})

describe('applyFilters', () => {
	test('gibt die Liste unveraendert zurueck, wenn kein Filter aktiv ist', () => {
		const list = makeList({ categories: [makeCategory({ items: [makeItem()] })] })
		expect(applyFilters(list, emptyFilters)).toEqual(list)
	})

	test('hideDone blendet gepackte Items aus', () => {
		const list = makeList({
			categories: [
				makeCategory({ items: [makeItem({ id: 'a', packed: true }), makeItem({ id: 'b', packed: false })] }),
			],
		})
		const filters: Filters = { ...emptyFilters, hideDone: true }

		const result = applyFilters(list, filters)

		expect(result.categories[0].items.map(i => i.id)).toEqual(['b'])
	})

	test('lastMinuteOnly zeigt nur Last-Minute-Items', () => {
		const list = makeList({
			categories: [
				makeCategory({
					items: [makeItem({ id: 'a', lastMinute: true }), makeItem({ id: 'b', lastMinute: false })],
				}),
			],
		})
		const filters: Filters = { ...emptyFilters, lastMinuteOnly: true }

		const result = applyFilters(list, filters)

		expect(result.categories[0].items.map(i => i.id)).toEqual(['a'])
	})

	test('personId zeigt nur Items der gewaehlten Person', () => {
		const list = makeList({
			categories: [
				makeCategory({
					items: [makeItem({ id: 'a', personId: 'p-1' }), makeItem({ id: 'b', personId: 'p-2' })],
				}),
			],
		})
		const filters: Filters = { ...emptyFilters, personId: 'p-1' }

		const result = applyFilters(list, filters)

		expect(result.categories[0].items.map(i => i.id)).toEqual(['a'])
	})

	test('Hauptkategorien ohne sichtbare Items (auch ueber Unterkategorien) werden ausgeblendet', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1', items: [makeItem({ id: 'a', packed: true })] })
		const main = makeCategory({ id: 'cat-1', items: [makeItem({ id: 'b', packed: true })], children: [sub] })
		const list = makeList({ categories: [main] })
		const filters: Filters = { ...emptyFilters, hideDone: true }

		const result = applyFilters(list, filters)

		expect(result.categories).toEqual([])
	})

	test('Unterkategorien ohne sichtbare Items werden ausgeblendet, Hauptkategorie bleibt wenn sie selbst sichtbare Items hat', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1', items: [makeItem({ id: 'a', packed: true })] })
		const main = makeCategory({ id: 'cat-1', items: [makeItem({ id: 'b', packed: false })], children: [sub] })
		const list = makeList({ categories: [main] })
		const filters: Filters = { ...emptyFilters, hideDone: true }

		const result = applyFilters(list, filters)

		expect(result.categories.map(c => c.id)).toEqual(['cat-1'])
		expect(result.categories[0].items.map(i => i.id)).toEqual(['b'])
		expect(result.categories[0].children).toEqual([])
	})

	test('Hauptkategorie ohne eigene sichtbare Items bleibt, wenn eine Unterkategorie sichtbare Items hat', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1', items: [makeItem({ id: 'a', packed: false })] })
		const main = makeCategory({ id: 'cat-1', items: [makeItem({ id: 'b', packed: true })], children: [sub] })
		const list = makeList({ categories: [main] })
		const filters: Filters = { ...emptyFilters, hideDone: true }

		const result = applyFilters(list, filters)

		expect(result.categories.map(c => c.id)).toEqual(['cat-1'])
		expect(result.categories[0].items).toEqual([])
		expect(result.categories[0].children.map(c => c.id)).toEqual(['cat-sub'])
	})

	test('veraendert die uebergebene Liste nicht (Immutability)', () => {
		const main = makeCategory({ items: [makeItem({ id: 'a', packed: true })] })
		const list = makeList({ categories: [main] })
		const filters: Filters = { ...emptyFilters, hideDone: true }

		applyFilters(list, filters)

		expect(list.categories[0].items).toHaveLength(1)
	})
})

describe('countOpenLastMinute', () => {
	test('zaehlt nur ungepackte Last-Minute-Items ueber alle Kategorien', () => {
		const sub = makeCategory({
			id: 'cat-sub',
			parentId: 'cat-1',
			items: [makeItem({ id: 'a', lastMinute: true, packed: false })],
		})
		const main = makeCategory({
			id: 'cat-1',
			items: [
				makeItem({ id: 'b', lastMinute: true, packed: false }),
				makeItem({ id: 'c', lastMinute: true, packed: true }),
				makeItem({ id: 'd', lastMinute: false, packed: false }),
			],
			children: [sub],
		})
		const list = makeList({ categories: [main] })

		expect(countOpenLastMinute(list)).toBe(2)
	})

	test('0 wenn keine offenen Last-Minute-Items existieren', () => {
		const list = makeList({ categories: [makeCategory({ items: [makeItem({ lastMinute: false })] })] })
		expect(countOpenLastMinute(list)).toBe(0)
	})
})
