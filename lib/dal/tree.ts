import type { Category, Item, List, Person } from '@/lib/db/schema'

export type CategoryWithItems = Category & { items: Item[] }
export type CategoryTree = CategoryWithItems & { children: CategoryWithItems[] }
export type ListWithContent = List & { categories: CategoryTree[]; persons: Person[] }

function bySortOrder<T extends { sortOrder: number }>(a: T, b: T): number {
	return a.sortOrder - b.sortOrder
}

export function buildTree(categories: CategoryWithItems[]): CategoryTree[] {
	const sorted = categories.map(category => ({
		...category,
		items: [...category.items].sort(bySortOrder),
	}))

	return sorted
		.filter(category => category.parentId === null)
		.sort(bySortOrder)
		.map(main => ({
			...main,
			children: sorted
				.filter(category => category.parentId === main.id)
				.sort(bySortOrder),
		}))
}
