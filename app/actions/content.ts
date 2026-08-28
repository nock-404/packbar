'use server'

import { revalidatePath } from 'next/cache'
import { requireUserId } from './session'
import {
	createCategory as createCategoryDal,
	renameCategory as renameCategoryDal,
	deleteCategory as deleteCategoryDal,
	reorderCategories as reorderCategoriesDal,
	createItem as createItemDal,
	updateItem as updateItemDal,
	deleteItem as deleteItemDal,
	reorderItems as reorderItemsDal,
	moveItem as moveItemDal,
	createPerson as createPersonDal,
	renamePerson as renamePersonDal,
	deletePerson as deletePersonDal,
	createItemsBulk as createItemsBulkDal,
	resolveCategoryList,
} from '@/lib/dal/content'
import type { Category, Item, Person } from '@/lib/db/schema'
import type { ImportEntry } from '@/lib/import'

export async function createCategory(listId: string, name: string, parentId: string | null): Promise<Category> {
	const userId = await requireUserId()
	const category = await createCategoryDal(listId, userId, name, parentId)
	revalidatePath(`/lists/${listId}`)
	return category
}

export async function renameCategory(categoryId: string, name: string): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await renameCategoryDal(categoryId, userId, name)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function deleteCategory(categoryId: string): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await deleteCategoryDal(categoryId, userId)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function reorderCategories(listId: string, orderedIds: string[], parentId: string | null): Promise<void> {
	const userId = await requireUserId()
	await reorderCategoriesDal(listId, userId, orderedIds, parentId)
	revalidatePath(`/lists/${listId}`)
}

export async function createItem(categoryId: string, name: string): Promise<Item> {
	const userId = await requireUserId()
	const item = await createItemDal(categoryId, userId, name)
	const listId = await resolveCategoryList(categoryId)
	revalidatePath(`/lists/${listId}`)
	return item
}

export async function createItemsBulk(categoryId: string, entries: ImportEntry[]): Promise<{ listId: string; count: number }> {
	const userId = await requireUserId()
	const result = await createItemsBulkDal(categoryId, userId, entries)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function updateItem(itemId: string, patch: Partial<Pick<Item, 'name' | 'quantity' | 'note' | 'lastMinute' | 'packed' | 'personId'>>): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await updateItemDal(itemId, userId, patch)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function deleteItem(itemId: string): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await deleteItemDal(itemId, userId)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function reorderItems(categoryId: string, orderedIds: string[]): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await reorderItemsDal(categoryId, userId, orderedIds)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function moveItem(itemId: string, toCategoryId: string, index: number): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await moveItemDal(itemId, userId, toCategoryId, index)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function createPerson(listId: string, name: string): Promise<Person> {
	const userId = await requireUserId()
	const person = await createPersonDal(listId, userId, name)
	revalidatePath(`/lists/${listId}`)
	return person
}

export async function renamePerson(personId: string, name: string): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await renamePersonDal(personId, userId, name)
	revalidatePath(`/lists/${result.listId}`)
	return result
}

export async function deletePerson(personId: string): Promise<{ listId: string }> {
	const userId = await requireUserId()
	const result = await deletePersonDal(personId, userId)
	revalidatePath(`/lists/${result.listId}`)
	return result
}
