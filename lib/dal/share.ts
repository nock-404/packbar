import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lists } from '@/lib/db/schema'
import type { Item, ShareMode } from '@/lib/db/schema'
import { assertListOwner, getListWithContent } from './lists'
import type { ListWithContent } from './tree'
import { resolveCategoryList, resolveItemList, createItemRow, updateItemRow, deleteItemRow } from './content'

function generateToken(): string {
	return randomBytes(24).toString('base64url')
}

async function resolveSharedList(token: string): Promise<{ listId: string; shareMode: ShareMode }> {
	const row = await db.query.lists.findFirst({
		where: eq(lists.shareToken, token),
		columns: { id: true, shareMode: true },
	})
	if (!row) throw new Error('not_found')
	return { listId: row.id, shareMode: row.shareMode }
}

export async function setShareMode(listId: string, userId: string, mode: ShareMode): Promise<{ shareToken: string | null }> {
	await assertListOwner(listId, userId)

	if (mode === 'off') {
		await db.update(lists).set({ shareMode: 'off', shareToken: null }).where(eq(lists.id, listId))
		return { shareToken: null }
	}

	const current = await db.query.lists.findFirst({
		where: eq(lists.id, listId),
		columns: { shareToken: true },
	})
	const shareToken = current?.shareToken ?? generateToken()
	await db.update(lists).set({ shareMode: mode, shareToken }).where(eq(lists.id, listId))
	return { shareToken }
}

export async function rotateShareToken(listId: string, userId: string): Promise<{ shareToken: string }> {
	await assertListOwner(listId, userId)

	const current = await db.query.lists.findFirst({
		where: eq(lists.id, listId),
		columns: { shareMode: true },
	})
	if (!current || current.shareMode === 'off') throw new Error('sharing_disabled')

	const shareToken = generateToken()
	await db.update(lists).set({ shareToken }).where(eq(lists.id, listId))
	return { shareToken }
}

export async function getSharedList(token: string): Promise<{ list: ListWithContent; mode: 'read' | 'edit' } | null> {
	const row = await db.query.lists.findFirst({ where: eq(lists.shareToken, token) })
	if (!row) return null
	if (row.shareMode === 'off') return null

	const list = await getListWithContent(row.id, row.userId)
	if (!list) return null

	return { list, mode: row.shareMode }
}

export async function updateItemByToken(token: string, itemId: string, patch: Partial<Pick<Item, 'name' | 'quantity' | 'note' | 'lastMinute' | 'packed' | 'personId'>>): Promise<void> {
	const shared = await resolveSharedList(token)
	if (shared.shareMode !== 'edit') throw new Error('not_editable')

	const listId = await resolveItemList(itemId)
	if (listId !== shared.listId) throw new Error('not_found')

	await updateItemRow(itemId, listId, patch)
}

export async function createItemByToken(token: string, categoryId: string, name: string): Promise<Item> {
	const shared = await resolveSharedList(token)
	if (shared.shareMode !== 'edit') throw new Error('not_editable')

	const listId = await resolveCategoryList(categoryId)
	if (listId !== shared.listId) throw new Error('not_found')

	return createItemRow(categoryId, listId, name)
}

export async function deleteItemByToken(token: string, itemId: string): Promise<void> {
	const shared = await resolveSharedList(token)
	if (shared.shareMode !== 'edit') throw new Error('not_editable')

	const listId = await resolveItemList(itemId)
	if (listId !== shared.listId) throw new Error('not_found')

	await deleteItemRow(itemId, listId)
}
