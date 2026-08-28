'use client'

import { createContext, useContext } from 'react'
import type { Item, Person } from '@/lib/db/schema'

export type ListActions = {
	editable: boolean
	tokenMode: string | null
	canManageCategories: boolean
	persons: Person[]
	toggleItem: (itemId: string, packed: boolean) => void
	updateItem: (itemId: string, patch: Partial<Item>) => void
	addItem: (categoryId: string, name: string) => void
	removeItem: (itemId: string) => void
	addCategory: (name: string, parentId: string | null) => void
	renameCategory: (categoryId: string, name: string) => void
	removeCategory: (categoryId: string) => void
	addPerson: (name: string) => void
	renamePerson: (personId: string, name: string) => void
	removePerson: (personId: string) => void
	openImport?: (categoryId?: string) => void
	dndInstanceId: symbol | null
}

export const ListActionsContext = createContext<ListActions | null>(null)

export function useListActions(): ListActions {
	const context = useContext(ListActionsContext)
	if (!context) throw new Error('useListActions must be used within a ListActionsContext.Provider')
	return context
}
