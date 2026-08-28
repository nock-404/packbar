import { describe, expect, test } from 'vitest'
import { listReducer } from './listReducer'
import type { ListWithContent, CategoryTree } from '@/lib/dal/tree'
import type { Item, Person } from '@/lib/db/schema'

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

function makePerson(overrides: Partial<Person> = {}): Person {
	return {
		id: 'person-1',
		listId: 'list-1',
		name: 'Anna',
		sortOrder: 0,
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

describe('listReducer: toggleItem', () => {
	test('setzt packed auf dem passenden Item, auch in Unterkategorien', () => {
		const sub = makeCategory({
			id: 'cat-sub',
			parentId: 'cat-1',
			items: [makeItem({ id: 'item-2', categoryId: 'cat-sub' })],
		})
		const main = makeCategory({ items: [makeItem({ packed: false })], children: [sub] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'toggleItem', itemId: 'item-2', packed: true })

		expect(next.categories[0].items[0].packed).toBe(false)
		expect(next.categories[0].children[0].items[0].packed).toBe(true)
	})

	test('lässt die Liste unveraendert, wenn die Item-Id nicht existiert', () => {
		const main = makeCategory({ items: [makeItem()] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'toggleItem', itemId: 'unknown', packed: true })

		expect(next.categories[0].items[0].packed).toBe(false)
	})
})

describe('listReducer: updateItem', () => {
	test('merged das Patch in das bestehende Item', () => {
		const main = makeCategory({ items: [makeItem({ quantity: null, note: null })] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, {
			type: 'updateItem',
			itemId: 'item-1',
			patch: { quantity: 3, note: 'Reisegroesse', lastMinute: true },
		})

		expect(next.categories[0].items[0]).toMatchObject({ quantity: 3, note: 'Reisegroesse', lastMinute: true })
	})
})

describe('listReducer: addItem / removeItem', () => {
	test('addItem haengt das Item an die passende Kategorie', () => {
		const main = makeCategory({ items: [] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'addItem', categoryId: 'cat-1', item: makeItem({ id: 'item-new' }) })

		expect(next.categories[0].items.map(i => i.id)).toEqual(['item-new'])
	})

	test('addItem haengt das Item an eine Unterkategorie', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1', items: [] })
		const main = makeCategory({ children: [sub] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, {
			type: 'addItem',
			categoryId: 'cat-sub',
			item: makeItem({ id: 'item-new', categoryId: 'cat-sub' }),
		})

		expect(next.categories[0].children[0].items.map(i => i.id)).toEqual(['item-new'])
	})

	test('removeItem entfernt das Item aus der Kategorie', () => {
		const main = makeCategory({ items: [makeItem({ id: 'item-1' }), makeItem({ id: 'item-2' })] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'removeItem', itemId: 'item-1' })

		expect(next.categories[0].items.map(i => i.id)).toEqual(['item-2'])
	})
})

describe('listReducer: confirmItem', () => {
	test('ersetzt das optimistische Item durch das echte, an gleicher Stelle', () => {
		const tempItem = makeItem({ id: 'temp-123', name: 'Neu' })
		const main = makeCategory({ items: [tempItem] })
		const list = makeList({ categories: [main] })

		const realItem = makeItem({ id: 'real-456', name: 'Neu' })
		const next = listReducer(list, { type: 'confirmItem', tempId: 'temp-123', item: realItem })

		expect(next.categories[0].items).toEqual([realItem])
	})
})

describe('listReducer: addCategory / renameCategory / removeCategory', () => {
	test('addCategory ohne parentId haengt eine neue Hauptkategorie an', () => {
		const list = makeList({ categories: [makeCategory({ id: 'cat-1' })] })

		const next = listReducer(list, {
			type: 'addCategory',
			category: makeCategory({ id: 'cat-2', name: 'Technik' }),
		})

		expect(next.categories.map(c => c.id)).toEqual(['cat-1', 'cat-2'])
	})

	test('addCategory mit parentId haengt eine Unterkategorie an die Hauptkategorie', () => {
		const list = makeList({ categories: [makeCategory({ id: 'cat-1', children: [] })] })

		const next = listReducer(list, {
			type: 'addCategory',
			category: makeCategory({ id: 'cat-sub', parentId: 'cat-1', name: 'Schuhe' }),
		})

		expect(next.categories[0].children.map(c => c.id)).toEqual(['cat-sub'])
	})

	test('renameCategory benennt Haupt- und Unterkategorien um', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1' })
		const list = makeList({ categories: [makeCategory({ id: 'cat-1', children: [sub] })] })

		const next = listReducer(list, { type: 'renameCategory', categoryId: 'cat-sub', name: 'Neue Schuhe' })

		expect(next.categories[0].children[0].name).toBe('Neue Schuhe')
	})

	test('removeCategory entfernt Haupt- und Unterkategorien', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1' })
		const list = makeList({
			categories: [makeCategory({ id: 'cat-1', children: [sub] }), makeCategory({ id: 'cat-2' })],
		})

		const afterSub = listReducer(list, { type: 'removeCategory', categoryId: 'cat-sub' })
		expect(afterSub.categories[0].children).toEqual([])

		const afterMain = listReducer(afterSub, { type: 'removeCategory', categoryId: 'cat-2' })
		expect(afterMain.categories.map(c => c.id)).toEqual(['cat-1'])
	})
})

describe('listReducer: persons', () => {
	test('addPerson / renamePerson / removePerson', () => {
		const list = makeList({ persons: [] })

		const withPerson = listReducer(list, { type: 'addPerson', person: makePerson({ id: 'p-1', name: 'Anna' }) })
		expect(withPerson.persons.map(p => p.name)).toEqual(['Anna'])

		const renamed = listReducer(withPerson, { type: 'renamePerson', personId: 'p-1', name: 'Anna B.' })
		expect(renamed.persons[0].name).toBe('Anna B.')

		const removed = listReducer(renamed, { type: 'removePerson', personId: 'p-1' })
		expect(removed.persons).toEqual([])
	})
})

describe('listReducer: resetPacked', () => {
	test('setzt packed bei allen Items auf false, inkl. Unterkategorien', () => {
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-1', items: [makeItem({ id: 'item-2', packed: true })] })
		const main = makeCategory({ items: [makeItem({ id: 'item-1', packed: true })], children: [sub] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'resetPacked' })

		expect(next.categories[0].items[0].packed).toBe(false)
		expect(next.categories[0].children[0].items[0].packed).toBe(false)
	})
})

describe('listReducer: reorderItems', () => {
	test('ordnet die Items einer Kategorie gemaess orderedIds neu', () => {
		const main = makeCategory({
			items: [makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })],
		})
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'reorderItems', categoryId: 'cat-1', orderedIds: ['c', 'a', 'b'] })

		expect(next.categories[0].items.map(i => i.id)).toEqual(['c', 'a', 'b'])
	})

	test('ordnet Items in einer Unterkategorie neu', () => {
		const sub = makeCategory({
			id: 'cat-sub',
			parentId: 'cat-1',
			items: [makeItem({ id: 'a', categoryId: 'cat-sub' }), makeItem({ id: 'b', categoryId: 'cat-sub' })],
		})
		const main = makeCategory({ children: [sub] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'reorderItems', categoryId: 'cat-sub', orderedIds: ['b', 'a'] })

		expect(next.categories[0].children[0].items.map(i => i.id)).toEqual(['b', 'a'])
	})
})

describe('listReducer: moveItem', () => {
	test('verschiebt ein Item in eine andere Hauptkategorie an den angegebenen Index', () => {
		const source = makeCategory({
			id: 'cat-1',
			items: [makeItem({ id: 'a', categoryId: 'cat-1' }), makeItem({ id: 'b', categoryId: 'cat-1' })],
		})
		const target = makeCategory({
			id: 'cat-2',
			items: [makeItem({ id: 'x', categoryId: 'cat-2' })],
		})
		const list = makeList({ categories: [source, target] })

		const next = listReducer(list, { type: 'moveItem', itemId: 'a', toCategoryId: 'cat-2', index: 0 })

		expect(next.categories[0].items.map(i => i.id)).toEqual(['b'])
		expect(next.categories[1].items.map(i => i.id)).toEqual(['a', 'x'])
		expect(next.categories[1].items[0].categoryId).toBe('cat-2')
	})

	test('verschiebt ein Item in eine leere Kategorie', () => {
		const source = makeCategory({ id: 'cat-1', items: [makeItem({ id: 'a', categoryId: 'cat-1' })] })
		const empty = makeCategory({ id: 'cat-2', items: [] })
		const list = makeList({ categories: [source, empty] })

		const next = listReducer(list, { type: 'moveItem', itemId: 'a', toCategoryId: 'cat-2', index: 0 })

		expect(next.categories[0].items).toEqual([])
		expect(next.categories[1].items.map(i => i.id)).toEqual(['a'])
	})

	test('verschiebt ein Item in eine Unterkategorie', () => {
		const source = makeCategory({ id: 'cat-1', items: [makeItem({ id: 'a', categoryId: 'cat-1' })] })
		const sub = makeCategory({ id: 'cat-sub', parentId: 'cat-2', items: [] })
		const target = makeCategory({ id: 'cat-2', items: [], children: [sub] })
		const list = makeList({ categories: [source, target] })

		const next = listReducer(list, { type: 'moveItem', itemId: 'a', toCategoryId: 'cat-sub', index: 0 })

		expect(next.categories[0].items).toEqual([])
		expect(next.categories[1].children[0].items.map(i => i.id)).toEqual(['a'])
		expect(next.categories[1].children[0].items[0].categoryId).toBe('cat-sub')
	})

	test('bleibt unveraendert, wenn die Item-Id nicht existiert', () => {
		const main = makeCategory({ items: [makeItem({ id: 'a' })] })
		const list = makeList({ categories: [main] })

		const next = listReducer(list, { type: 'moveItem', itemId: 'unknown', toCategoryId: 'cat-1', index: 0 })

		expect(next).toEqual(list)
	})
})

describe('listReducer: reorderCategories', () => {
	test('ordnet Hauptkategorien neu (parentId null)', () => {
		const list = makeList({
			categories: [makeCategory({ id: 'cat-1' }), makeCategory({ id: 'cat-2' }), makeCategory({ id: 'cat-3' })],
		})

		const next = listReducer(list, {
			type: 'reorderCategories',
			parentId: null,
			orderedIds: ['cat-3', 'cat-1', 'cat-2'],
		})

		expect(next.categories.map(c => c.id)).toEqual(['cat-3', 'cat-1', 'cat-2'])
	})

	test('ordnet Unterkategorien innerhalb ihres Parents neu', () => {
		const sub1 = makeCategory({ id: 'sub-1', parentId: 'cat-1' })
		const sub2 = makeCategory({ id: 'sub-2', parentId: 'cat-1' })
		const list = makeList({ categories: [makeCategory({ id: 'cat-1', children: [sub1, sub2] })] })

		const next = listReducer(list, {
			type: 'reorderCategories',
			parentId: 'cat-1',
			orderedIds: ['sub-2', 'sub-1'],
		})

		expect(next.categories[0].children.map(c => c.id)).toEqual(['sub-2', 'sub-1'])
	})
})

describe('listReducer: replace', () => {
	test('ersetzt den gesamten State', () => {
		const list = makeList({ name: 'Alt' })
		const replacement = makeList({ name: 'Neu' })

		const next = listReducer(list, { type: 'replace', list: replacement })

		expect(next).toEqual(replacement)
	})
})
