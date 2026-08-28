import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, items, persons, lists } from '@/lib/db/schema'
import type { Category, Item, Person } from '@/lib/db/schema'
import type { ImportEntry } from '@/lib/import'
import { assertListOwner } from './lists'

async function touchList(listId: string): Promise<void> {
	await db.update(lists).set({ updatedAt: new Date() }).where(eq(lists.id, listId))
}

export async function resolveCategoryList(categoryId: string): Promise<string> {
	const row = await db.query.categories.findFirst({
		where: eq(categories.id, categoryId),
		columns: { listId: true },
	})
	if (!row) throw new Error('not_found')
	return row.listId
}

export async function resolveItemList(itemId: string): Promise<string> {
	const rows = await db
		.select({ listId: categories.listId })
		.from(items)
		.innerJoin(categories, eq(items.categoryId, categories.id))
		.where(eq(items.id, itemId))
	if (rows.length === 0) throw new Error('not_found')
	return rows[0].listId
}

export async function resolvePersonList(personId: string): Promise<string> {
	const row = await db.query.persons.findFirst({
		where: eq(persons.id, personId),
		columns: { listId: true },
	})
	if (!row) throw new Error('not_found')
	return row.listId
}

async function nextCategorySortOrder(listId: string, parentId: string | null): Promise<number> {
	const rows = await db
		.select({ max: sql<number>`coalesce(max(${categories.sortOrder}), -1)::int` })
		.from(categories)
		.where(parentId === null
			? and(eq(categories.listId, listId), isNull(categories.parentId))
			: and(eq(categories.listId, listId), eq(categories.parentId, parentId)))
	return (rows[0]?.max ?? -1) + 1
}

async function nextItemSortOrder(categoryId: string): Promise<number> {
	const rows = await db
		.select({ max: sql<number>`coalesce(max(${items.sortOrder}), -1)::int` })
		.from(items)
		.where(eq(items.categoryId, categoryId))
	return (rows[0]?.max ?? -1) + 1
}

async function nextPersonSortOrder(listId: string): Promise<number> {
	const rows = await db
		.select({ max: sql<number>`coalesce(max(${persons.sortOrder}), -1)::int` })
		.from(persons)
		.where(eq(persons.listId, listId))
	return (rows[0]?.max ?? -1) + 1
}

export async function createCategory(listId: string, userId: string, name: string, parentId: string | null): Promise<Category> {
	await assertListOwner(listId, userId)

	if (parentId !== null) {
		const parent = await db.query.categories.findFirst({
			where: and(eq(categories.id, parentId), eq(categories.listId, listId)),
		})
		if (!parent) throw new Error('not_found')
		if (parent.parentId !== null) throw new Error('nesting_too_deep')
	}

	const sortOrder = await nextCategorySortOrder(listId, parentId)
	const [category] = await db
		.insert(categories)
		.values({ id: crypto.randomUUID(), listId, parentId, name, sortOrder })
		.returning()
	await touchList(listId)
	return category
}

export async function renameCategory(categoryId: string, userId: string, name: string): Promise<{ listId: string }> {
	const listId = await resolveCategoryList(categoryId)
	await assertListOwner(listId, userId)
	await db.update(categories).set({ name }).where(eq(categories.id, categoryId))
	await touchList(listId)
	return { listId }
}

export async function deleteCategory(categoryId: string, userId: string): Promise<{ listId: string }> {
	const listId = await resolveCategoryList(categoryId)
	await assertListOwner(listId, userId)
	await db.delete(categories).where(eq(categories.id, categoryId))
	await touchList(listId)
	return { listId }
}

export async function reorderCategories(listId: string, userId: string, orderedIds: string[], parentId: string | null): Promise<void> {
	await assertListOwner(listId, userId)
	await Promise.all(orderedIds.map((id, index) =>
		db
			.update(categories)
			.set({ sortOrder: index })
			.where(and(
				eq(categories.id, id),
				eq(categories.listId, listId),
				parentId === null ? isNull(categories.parentId) : eq(categories.parentId, parentId),
			)),
	))
	await touchList(listId)
}

export async function createItemRow(categoryId: string, listId: string, name: string): Promise<Item> {
	const sortOrder = await nextItemSortOrder(categoryId)
	const [item] = await db
		.insert(items)
		.values({ id: crypto.randomUUID(), categoryId, name, sortOrder })
		.returning()
	await touchList(listId)
	return item
}

export async function updateItemRow(itemId: string, listId: string, patch: Partial<Pick<Item, 'name' | 'quantity' | 'note' | 'lastMinute' | 'packed' | 'personId'>>): Promise<{ listId: string }> {
	await db.update(items).set(patch).where(eq(items.id, itemId))
	await touchList(listId)
	return { listId }
}

export async function deleteItemRow(itemId: string, listId: string): Promise<{ listId: string }> {
	await db.delete(items).where(eq(items.id, itemId))
	await touchList(listId)
	return { listId }
}

export async function createItem(categoryId: string, userId: string, name: string): Promise<Item> {
	const listId = await resolveCategoryList(categoryId)
	await assertListOwner(listId, userId)
	return createItemRow(categoryId, listId, name)
}

export async function createItemsBulk(categoryId: string, userId: string, entries: ImportEntry[]): Promise<{ listId: string; count: number }> {
	const listId = await resolveCategoryList(categoryId)
	await assertListOwner(listId, userId)

	if (entries.length === 0) return { listId, count: 0 }

	const startSortOrder = await nextItemSortOrder(categoryId)
	await db.insert(items).values(entries.map((entry, index) => ({
		id: crypto.randomUUID(),
		categoryId,
		name: entry.name,
		quantity: entry.quantity,
		sortOrder: startSortOrder + index,
	})))
	await touchList(listId)
	return { listId, count: entries.length }
}

export async function updateItem(itemId: string, userId: string, patch: Partial<Pick<Item, 'name' | 'quantity' | 'note' | 'lastMinute' | 'packed' | 'personId'>>): Promise<{ listId: string }> {
	const listId = await resolveItemList(itemId)
	await assertListOwner(listId, userId)
	return updateItemRow(itemId, listId, patch)
}

export async function deleteItem(itemId: string, userId: string): Promise<{ listId: string }> {
	const listId = await resolveItemList(itemId)
	await assertListOwner(listId, userId)
	return deleteItemRow(itemId, listId)
}

export async function reorderItems(categoryId: string, userId: string, orderedIds: string[]): Promise<{ listId: string }> {
	const listId = await resolveCategoryList(categoryId)
	await assertListOwner(listId, userId)
	await Promise.all(orderedIds.map((id, index) =>
		db.update(items).set({ sortOrder: index }).where(and(eq(items.id, id), eq(items.categoryId, categoryId))),
	))
	await touchList(listId)
	return { listId }
}

export async function moveItem(itemId: string, userId: string, toCategoryId: string, index: number): Promise<{ listId: string }> {
	const listId = await resolveItemList(itemId)
	await assertListOwner(listId, userId)
	const targetListId = await resolveCategoryList(toCategoryId)
	if (targetListId !== listId) throw new Error('not_found')

	await db.update(items).set({ categoryId: toCategoryId, sortOrder: index }).where(eq(items.id, itemId))
	await touchList(listId)
	return { listId }
}

export async function createPerson(listId: string, userId: string, name: string): Promise<Person> {
	await assertListOwner(listId, userId)
	const sortOrder = await nextPersonSortOrder(listId)
	const [person] = await db
		.insert(persons)
		.values({ id: crypto.randomUUID(), listId, name, sortOrder })
		.returning()
	await touchList(listId)
	return person
}

export async function renamePerson(personId: string, userId: string, name: string): Promise<{ listId: string }> {
	const listId = await resolvePersonList(personId)
	await assertListOwner(listId, userId)
	await db.update(persons).set({ name }).where(eq(persons.id, personId))
	await touchList(listId)
	return { listId }
}

export async function deletePerson(personId: string, userId: string): Promise<{ listId: string }> {
	const listId = await resolvePersonList(personId)
	await assertListOwner(listId, userId)
	await db.delete(persons).where(eq(persons.id, personId))
	await touchList(listId)
	return { listId }
}
