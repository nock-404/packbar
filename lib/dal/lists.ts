import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lists, categories, items, persons } from '@/lib/db/schema'
import type { List, NewCategory, NewItem, NewPerson } from '@/lib/db/schema'
import type { Progress } from '@/lib/progress'
import { templateToRows, contentToRows, filterTemplate } from '@/lib/template'
import { defaultTemplate } from '@/lib/default-template'
import { randomCoverId } from '@/lib/covers'
import { nightsBetween, suggestQuantities } from '@/lib/suggestions'
import { buildTree } from './tree'
import type { ListWithContent } from './tree'

export interface ListSummary extends List {
	progress: Progress
}

export async function assertListOwner(listId: string, userId: string): Promise<void> {
	const row = await db.query.lists.findFirst({
		where: and(eq(lists.id, listId), eq(lists.userId, userId)),
		columns: { id: true },
	})
	if (!row) throw new Error('not_found')
}

async function progressByListId(listIds: string[]): Promise<Map<string, Progress>> {
	if (listIds.length === 0) return new Map()

	const rows = await db
		.select({
			listId: categories.listId,
			total: sql<number>`count(*)::int`,
			packed: sql<number>`count(*) filter (where ${items.packed})::int`,
		})
		.from(items)
		.innerJoin(categories, eq(items.categoryId, categories.id))
		.where(inArray(categories.listId, listIds))
		.groupBy(categories.listId)

	return new Map(rows.map(row => [row.listId, { packed: row.packed, total: row.total }]))
}

async function summariesFor(userId: string, isTemplate: boolean): Promise<ListSummary[]> {
	const rows = await db.query.lists.findMany({
		where: and(eq(lists.userId, userId), eq(lists.isTemplate, isTemplate)),
		orderBy: desc(lists.updatedAt),
	})

	const progress = await progressByListId(rows.map(row => row.id))

	return rows.map(row => ({ ...row, progress: progress.get(row.id) ?? { packed: 0, total: 0 } }))
}

export async function getListSummaries(userId: string): Promise<ListSummary[]> {
	return summariesFor(userId, false)
}

export async function getTemplates(userId: string): Promise<ListSummary[]> {
	return summariesFor(userId, true)
}

export async function getListWithContent(listId: string, userId: string): Promise<ListWithContent | null> {
	const list = await db.query.lists.findFirst({
		where: and(eq(lists.id, listId), eq(lists.userId, userId)),
	})
	if (!list) return null

	const [categoryRows, personRows] = await Promise.all([
		db.query.categories.findMany({ where: eq(categories.listId, listId), with: { items: true } }),
		db.query.persons.findMany({ where: eq(persons.listId, listId) }),
	])

	return { ...list, categories: buildTree(categoryRows), persons: personRows }
}

export type CreateSource =
	| { kind: 'empty' }
	| { kind: 'default'; categories?: string[] }
	| { kind: 'template'; templateId: string }
	| { kind: 'duplicate'; listId: string }

export interface CreateOptions {
	tripDate?: string | null
	tripEnd?: string | null
}

function applyQuantitySuggestions(rows: { items: NewItem[] }, tripDate: string, tripEnd: string): void {
	const nights = nightsBetween(tripDate, tripEnd)
	if (nights <= 0) return
	const byName = new Map(suggestQuantities(nights).map(suggestion => [suggestion.itemName, suggestion.quantity]))
	for (const item of rows.items) {
		const suggested = byName.get(item.name)
		if (suggested !== undefined && item.quantity == null) item.quantity = suggested
	}
}

export async function createList(userId: string, name: string, source: CreateSource, options: CreateOptions = {}): Promise<List> {
	const listId = crypto.randomUUID()

	return db.transaction(async tx => {
		const [list] = await tx
			.insert(lists)
			.values({
				id: listId,
				userId,
				name,
				coverImage: randomCoverId(),
				tripDate: options.tripDate ?? null,
				tripEnd: options.tripEnd ?? null,
			})
			.returning()

		const insertRows = async (rows: { categories: NewCategory[]; items: NewItem[]; persons: NewPerson[] }) => {
			if (rows.persons.length > 0) await tx.insert(persons).values(rows.persons)
			if (rows.categories.length > 0) await tx.insert(categories).values(rows.categories)
			if (rows.items.length > 0) await tx.insert(items).values(rows.items)
		}

		if (source.kind === 'default') {
			const template = source.categories ? filterTemplate(defaultTemplate, source.categories) : defaultTemplate
			const rows = templateToRows(listId, template)
			if (options.tripDate && options.tripEnd) applyQuantitySuggestions(rows, options.tripDate, options.tripEnd)
			await insertRows(rows)
		} else if (source.kind === 'template' || source.kind === 'duplicate') {
			const sourceId = source.kind === 'template' ? source.templateId : source.listId
			const full = await getListWithContent(sourceId, userId)
			if (!full) throw new Error('not_found')
			const opts = source.kind === 'template'
				? { resetPacked: true, includePersons: true }
				: { resetPacked: false, includePersons: true }
			await insertRows(contentToRows(listId, full, opts))
		}

		return list
	})
}

export async function updateList(listId: string, userId: string, patch: Partial<Pick<List, 'name' | 'coverImage' | 'destination' | 'tripDate' | 'tripEnd'>>): Promise<void> {
	await assertListOwner(listId, userId)
	await db.update(lists).set({ ...patch, updatedAt: new Date() }).where(eq(lists.id, listId))
}

export async function deleteList(listId: string, userId: string): Promise<void> {
	await assertListOwner(listId, userId)
	await db.delete(lists).where(eq(lists.id, listId))
}

export async function saveAsTemplate(listId: string, userId: string, name: string): Promise<List> {
	const full = await getListWithContent(listId, userId)
	if (!full) throw new Error('not_found')

	const templateId = crypto.randomUUID()

	return db.transaction(async tx => {
		const [template] = await tx.insert(lists).values({ id: templateId, userId, name, isTemplate: true }).returning()

		const rows = contentToRows(templateId, full, { resetPacked: true, includePersons: true })
		if (rows.persons.length > 0) await tx.insert(persons).values(rows.persons)
		if (rows.categories.length > 0) await tx.insert(categories).values(rows.categories)
		if (rows.items.length > 0) await tx.insert(items).values(rows.items)

		return template
	})
}

export async function resetAllPacked(listId: string, userId: string): Promise<void> {
	await assertListOwner(listId, userId)
	await db
		.update(items)
		.set({ packed: false })
		.where(inArray(items.categoryId, db.select({ id: categories.id }).from(categories).where(eq(categories.listId, listId))))
	await db.update(lists).set({ updatedAt: new Date() }).where(eq(lists.id, listId))
}
