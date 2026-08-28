'use server'

import { revalidatePath } from 'next/cache'
import { requireUserId } from './session'
import {
	getListSummaries as getListSummariesDal,
	getTemplates as getTemplatesDal,
	getListWithContent as getListWithContentDal,
	createList as createListDal,
	updateList as updateListDal,
	deleteList as deleteListDal,
	saveAsTemplate as saveAsTemplateDal,
	resetAllPacked as resetAllPackedDal,
} from '@/lib/dal/lists'
import type { CreateOptions, CreateSource, ListSummary } from '@/lib/dal/lists'
import type { List } from '@/lib/db/schema'
import type { ListWithContent } from '@/lib/dal/tree'

export async function getListSummaries(): Promise<ListSummary[]> {
	const userId = await requireUserId()
	return getListSummariesDal(userId)
}

export async function getTemplates(): Promise<ListSummary[]> {
	const userId = await requireUserId()
	return getTemplatesDal(userId)
}

export async function getListWithContent(listId: string): Promise<ListWithContent | null> {
	const userId = await requireUserId()
	return getListWithContentDal(listId, userId)
}

export async function createList(name: string, source: CreateSource, options?: CreateOptions): Promise<List> {
	const userId = await requireUserId()
	const list = await createListDal(userId, name, source, options)
	revalidatePath('/dashboard')
	return list
}

export async function updateList(listId: string, patch: Partial<Pick<List, 'name' | 'coverImage' | 'destination' | 'tripDate' | 'tripEnd'>>): Promise<void> {
	const userId = await requireUserId()
	await updateListDal(listId, userId, patch)
	revalidatePath('/dashboard')
	revalidatePath(`/lists/${listId}`)
}

export async function deleteList(listId: string): Promise<void> {
	const userId = await requireUserId()
	await deleteListDal(listId, userId)
	revalidatePath('/dashboard')
}

export async function saveAsTemplate(listId: string, name: string): Promise<List> {
	const userId = await requireUserId()
	const template = await saveAsTemplateDal(listId, userId, name)
	revalidatePath('/dashboard')
	return template
}

export async function resetAllPacked(listId: string): Promise<void> {
	const userId = await requireUserId()
	await resetAllPackedDal(listId, userId)
	revalidatePath('/dashboard')
	revalidatePath(`/lists/${listId}`)
}
