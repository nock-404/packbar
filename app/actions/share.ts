'use server'

import { revalidatePath } from 'next/cache'
import { requireUserId } from './session'
import {
	setShareMode as setShareModeDal,
	rotateShareToken as rotateShareTokenDal,
	getSharedList as getSharedListDal,
	updateItemByToken as updateItemByTokenDal,
	createItemByToken as createItemByTokenDal,
	deleteItemByToken as deleteItemByTokenDal,
} from '@/lib/dal/share'
import type { Item, ShareMode } from '@/lib/db/schema'
import type { ListWithContent } from '@/lib/dal/tree'

export async function setShareMode(listId: string, mode: ShareMode): Promise<{ shareToken: string | null }> {
	const userId = await requireUserId()
	const result = await setShareModeDal(listId, userId, mode)
	revalidatePath(`/lists/${listId}`)
	return result
}

export async function rotateShareToken(listId: string): Promise<{ shareToken: string }> {
	const userId = await requireUserId()
	const result = await rotateShareTokenDal(listId, userId)
	revalidatePath(`/lists/${listId}`)
	return result
}

export async function getSharedList(token: string): Promise<{ list: ListWithContent; mode: 'read' | 'edit' } | null> {
	return getSharedListDal(token)
}

export async function updateItemByToken(token: string, itemId: string, patch: Partial<Pick<Item, 'name' | 'quantity' | 'note' | 'lastMinute' | 'packed' | 'personId'>>): Promise<void> {
	await updateItemByTokenDal(token, itemId, patch)
}

export async function createItemByToken(token: string, categoryId: string, name: string): Promise<Item> {
	return createItemByTokenDal(token, categoryId, name)
}

export async function deleteItemByToken(token: string, itemId: string): Promise<void> {
	await deleteItemByTokenDal(token, itemId)
}
