import type { CategoryTree, CategoryWithItems, ListWithContent } from '@/lib/dal/tree'
import type { Item } from '@/lib/db/schema'

export type Filters = {
	hideDone: boolean
	lastMinuteOnly: boolean
	personId: string | null
}

export const emptyFilters: Filters = {
	hideDone: false,
	lastMinuteOnly: false,
	personId: null,
}

export function hasActiveFilters(filters: Filters): boolean {
	return filters.hideDone || filters.lastMinuteOnly || filters.personId !== null
}

function matchesItem(item: Item, filters: Filters): boolean {
	if (filters.hideDone && item.packed) return false
	if (filters.lastMinuteOnly && !item.lastMinute) return false
	if (filters.personId !== null && item.personId !== filters.personId) return false
	return true
}

function filterItems(items: Item[], filters: Filters): Item[] {
	return items.filter(item => matchesItem(item, filters))
}

function filterSubcategory(category: CategoryWithItems, filters: Filters): CategoryWithItems {
	return { ...category, items: filterItems(category.items, filters) }
}

export function applyFilters(list: ListWithContent, filters: Filters): ListWithContent {
	if (!hasActiveFilters(filters)) return list

	const categories: CategoryTree[] = list.categories
		.map(category => {
			const items = filterItems(category.items, filters)
			const children = category.children
				.map(child => filterSubcategory(child, filters))
				.filter(child => child.items.length > 0)
			return { ...category, items, children }
		})
		.filter(category => category.items.length > 0 || category.children.length > 0)

	return { ...list, categories }
}

export function countOpenLastMinute(list: ListWithContent): number {
	const allItems = list.categories.flatMap(category => [
		...category.items,
		...category.children.flatMap(child => child.items),
	])
	return allItems.filter(item => item.lastMinute && !item.packed).length
}
