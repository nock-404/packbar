import { beforeAll, describe, expect, test } from 'vitest'
import { db } from '@/lib/db'
import { user } from '@/lib/db/auth-schema'
import { createList, getListSummaries, getListWithContent, deleteList, resetAllPacked, saveAsTemplate, getTemplates } from './lists'
import { createCategory, createItem, updateItem, deleteCategory, createPerson, createItemsBulk, moveItem } from './content'
import { setShareMode, getSharedList, updateItemByToken, rotateShareToken } from './share'

const uid = () => crypto.randomUUID()

async function makeUser() {
	const id = uid()
	await db.insert(user).values({
		id,
		name: 'Test',
		email: `${id}@test.local`,
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	})
	return id
}

let userA: string
let userB: string

beforeAll(async () => {
	userA = await makeUser()
	userB = await makeUser()
})

describe('lists', () => {
	test('createList default füllt aus Vorlage', async () => {
		const list = await createList(userA, 'Test Urlaub', { kind: 'default' })
		const full = await getListWithContent(list.id, userA)
		expect(full).not.toBeNull()
		expect(full!.categories.length).toBeGreaterThanOrEqual(15)
		const kleidung = full!.categories.find(c => c.name === 'Kleidung')!
		expect(kleidung.children.length).toBeGreaterThanOrEqual(5)
	})
	test('createList default mit categories-Auswahl liefert nur gewaehlte Kategorien', async () => {
		const list = await createList(userA, 'Kurztrip', {
			kind: 'default',
			categories: ['Dokumente & Papiere', 'Schuhe'],
		})
		const full = await getListWithContent(list.id, userA)
		expect(full).not.toBeNull()
		expect(full!.categories.map(c => c.name).sort()).toEqual(['Dokumente & Papiere', 'Schuhe'])
	})
	test('fremde Liste ist unsichtbar', async () => {
		const list = await createList(userA, 'Privat', { kind: 'empty' })
		expect(await getListWithContent(list.id, userB)).toBeNull()
	})
	test('duplicate kopiert inklusive Haken, template resettet', async () => {
		const list = await createList(userA, 'Quelle', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		const item = await createItem(cat.id, userA, 'Ding')
		await updateItem(item.id, userA, { packed: true })
		const dup = await createList(userA, 'Kopie', { kind: 'duplicate', listId: list.id })
		const dupFull = await getListWithContent(dup.id, userA)
		expect(dupFull!.categories[0].items[0].packed).toBe(true)
		const tpl = await saveAsTemplate(list.id, userA, 'Meine Vorlage')
		const tplFull = await getListWithContent(tpl.id, userA)
		expect(tplFull!.isTemplate).toBe(true)
		expect(tplFull!.categories[0].items[0].packed).toBe(false)
		expect((await getTemplates(userA)).some(t => t.id === tpl.id)).toBe(true)
	})
	test('resetAllPacked', async () => {
		const list = await createList(userA, 'Reset', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		const item = await createItem(cat.id, userA, 'Ding')
		await updateItem(item.id, userA, { packed: true })
		await resetAllPacked(list.id, userA)
		const full = await getListWithContent(list.id, userA)
		expect(full!.categories[0].items[0].packed).toBe(false)
	})
	test('summaries mit progress', async () => {
		const list = await createList(userA, 'Progress', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		const i1 = await createItem(cat.id, userA, 'A')
		await createItem(cat.id, userA, 'B')
		await updateItem(i1.id, userA, { packed: true })
		const summaries = await getListSummaries(userA)
		const s = summaries.find(x => x.id === list.id)!
		expect(s.progress).toEqual({ packed: 1, total: 2 })
	})
})

describe('content', () => {
	test('unterkategorie unter unterkategorie verboten', async () => {
		const list = await createList(userA, 'Nest', { kind: 'empty' })
		const parent = await createCategory(list.id, userA, 'Haupt', null)
		const sub = await createCategory(list.id, userA, 'Unter', parent.id)
		await expect(createCategory(list.id, userA, 'Zutief', sub.id)).rejects.toThrow('nesting_too_deep')
	})
	test('person löschen setzt item personId auf null', async () => {
		const list = await createList(userA, 'Pers', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		const person = await createPerson(list.id, userA, 'Matteo')
		const item = await createItem(cat.id, userA, 'Ding')
		await updateItem(item.id, userA, { personId: person.id })
		const { deletePerson } = await import('./content')
		await deletePerson(person.id, userA)
		const full = await getListWithContent(list.id, userA)
		expect(full!.categories[0].items[0].personId).toBeNull()
	})
	test('kategorie löschen nimmt items mit', async () => {
		const list = await createList(userA, 'Del', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		await createItem(cat.id, userA, 'Ding')
		await deleteCategory(cat.id, userA)
		const full = await getListWithContent(list.id, userA)
		expect(full!.categories).toHaveLength(0)
	})
	test('parentId aus anderer Liste ist not_found', async () => {
		const listA = await createList(userA, 'ListeA', { kind: 'empty' })
		const listB = await createList(userA, 'ListeB', { kind: 'empty' })
		const parentInA = await createCategory(listA.id, userA, 'Haupt A', null)
		await expect(createCategory(listB.id, userA, 'Unter B', parentInA.id)).rejects.toThrow('not_found')
	})
	test('createItemsBulk legt alle Einträge mit fortlaufendem sortOrder an', async () => {
		const list = await createList(userA, 'Import', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		await createItem(cat.id, userA, 'Bestehend')
		const result = await createItemsBulk(cat.id, userA, [
			{ name: 'Socken', quantity: 3 },
			{ name: 'T-Shirt', quantity: null },
		])
		expect(result).toEqual({ listId: list.id, count: 2 })
		const full = await getListWithContent(list.id, userA)
		const items = full!.categories[0].items
		expect(items).toHaveLength(3)
		expect(items[0]).toMatchObject({ name: 'Bestehend', sortOrder: 0 })
		expect(items[1]).toMatchObject({ name: 'Socken', quantity: 3, sortOrder: 1 })
		expect(items[2]).toMatchObject({ name: 'T-Shirt', quantity: null, sortOrder: 2 })
	})
	test('createItemsBulk prüft Ownership', async () => {
		const list = await createList(userA, 'Fremd', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		await expect(createItemsBulk(cat.id, userB, [{ name: 'X', quantity: null }])).rejects.toThrow('not_found')
	})
	test('moveItem verschiebt ein Item in eine andere Kategorie derselben Liste', async () => {
		const list = await createList(userA, 'Move', { kind: 'empty' })
		const source = await createCategory(list.id, userA, 'Quelle', null)
		const target = await createCategory(list.id, userA, 'Ziel', null)
		const item = await createItem(source.id, userA, 'Ding')

		await moveItem(item.id, userA, target.id, 0)

		const full = await getListWithContent(list.id, userA)
		const targetCategory = full!.categories.find(c => c.id === target.id)!
		const sourceCategory = full!.categories.find(c => c.id === source.id)!
		expect(targetCategory.items.map(i => i.id)).toEqual([item.id])
		expect(sourceCategory.items).toHaveLength(0)
	})
	test('moveItem verweigert Kategorien aus einer anderen Liste', async () => {
		const listA = await createList(userA, 'ListeA', { kind: 'empty' })
		const catA = await createCategory(listA.id, userA, 'K', null)
		const item = await createItem(catA.id, userA, 'Ding')
		const listB = await createList(userA, 'ListeB', { kind: 'empty' })
		const catB = await createCategory(listB.id, userA, 'K', null)

		await expect(moveItem(item.id, userA, catB.id, 0)).rejects.toThrow('not_found')
	})
	test('moveItem prüft Ownership', async () => {
		const list = await createList(userA, 'Fremd2', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		const other = await createCategory(list.id, userA, 'Andere', null)
		const item = await createItem(cat.id, userA, 'Ding')

		await expect(moveItem(item.id, userB, other.id, 0)).rejects.toThrow('not_found')
	})
})

describe('share', () => {
	test('token flow read/edit/off', async () => {
		const list = await createList(userA, 'Share', { kind: 'empty' })
		const cat = await createCategory(list.id, userA, 'K', null)
		const item = await createItem(cat.id, userA, 'Ding')
		const { shareToken } = await setShareMode(list.id, userA, 'read')
		expect(shareToken).toBeTruthy()
		const shared = await getSharedList(shareToken!)
		expect(shared!.mode).toBe('read')
		await expect(updateItemByToken(shareToken!, item.id, { packed: true })).rejects.toThrow('not_editable')
		await setShareMode(list.id, userA, 'edit')
		await updateItemByToken(shareToken!, item.id, { packed: true })
		const rotated = await rotateShareToken(list.id, userA)
		expect(rotated.shareToken).not.toBe(shareToken)
		expect(await getSharedList(shareToken!)).toBeNull()
		await setShareMode(list.id, userA, 'off')
		expect(await getSharedList(rotated.shareToken)).toBeNull()
	})
	test('off löscht den Token, neu aktivieren erzeugt frischen Token', async () => {
		const list = await createList(userA, 'ShareOff', { kind: 'empty' })
		const { shareToken: oldToken } = await setShareMode(list.id, userA, 'edit')
		await setShareMode(list.id, userA, 'off')
		const { shareToken: newToken } = await setShareMode(list.id, userA, 'read')
		expect(newToken).not.toBe(oldToken)
		expect(await getSharedList(oldToken!)).toBeNull()
	})
})
