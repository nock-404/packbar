import type { CategoryTree, ListWithContent } from '@/lib/dal/tree'
import type { Item, Person } from '@/lib/db/schema'

export type ListAction =
	| { type: 'replace'; list: ListWithContent }
	| { type: 'toggleItem'; itemId: string; packed: boolean }
	| { type: 'updateItem'; itemId: string; patch: Partial<Item> }
	| { type: 'addItem'; categoryId: string; item: Item }
	| { type: 'removeItem'; itemId: string }
	| { type: 'confirmItem'; tempId: string; item: Item }
	| { type: 'addCategory'; category: CategoryTree }
	| { type: 'renameCategory'; categoryId: string; name: string }
	| { type: 'removeCategory'; categoryId: string }
	| { type: 'addPerson'; person: Person }
	| { type: 'renamePerson'; personId: string; name: string }
	| { type: 'removePerson'; personId: string }
	| { type: 'resetPacked' }
	| { type: 'reorderItems'; categoryId: string; orderedIds: string[] }
	| { type: 'moveItem'; itemId: string; toCategoryId: string; index: number }
	| { type: 'reorderCategories'; parentId: string | null; orderedIds: string[] }

function mapAllItems(categories: CategoryTree[], fn: (item: Item) => Item | null): CategoryTree[] {
	const apply = (items: Item[]) =>
		items.flatMap(item => {
			const result = fn(item)
			return result === null ? [] : [result]
		})

	return categories.map(category => ({
		...category,
		items: apply(category.items),
		children: category.children.map(child => ({ ...child, items: apply(child.items) })),
	}))
}

function addItemToCategory(categories: CategoryTree[], categoryId: string, item: Item): CategoryTree[] {
	return categories.map(category => {
		if (category.id === categoryId) {
			return { ...category, items: [...category.items, item] }
		}
		return {
			...category,
			children: category.children.map(child =>
				child.id === categoryId ? { ...child, items: [...child.items, item] } : child,
			),
		}
	})
}

function addCategoryToTree(categories: CategoryTree[], category: CategoryTree): CategoryTree[] {
	if (category.parentId === null) {
		return [...categories, category]
	}
	return categories.map(main =>
		main.id === category.parentId ? { ...main, children: [...main.children, category] } : main,
	)
}

function renameCategoryInTree(categories: CategoryTree[], categoryId: string, name: string): CategoryTree[] {
	return categories.map(main => {
		if (main.id === categoryId) return { ...main, name }
		return {
			...main,
			children: main.children.map(child => (child.id === categoryId ? { ...child, name } : child)),
		}
	})
}

function removeCategoryFromTree(categories: CategoryTree[], categoryId: string): CategoryTree[] {
	return categories
		.filter(main => main.id !== categoryId)
		.map(main => ({ ...main, children: main.children.filter(child => child.id !== categoryId) }))
}

function orderById<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
	const byId = new Map(items.map(item => [item.id, item]))
	return orderedIds.flatMap(id => {
		const item = byId.get(id)
		return item ? [item] : []
	})
}

function reorderItemsInCategory(categories: CategoryTree[], categoryId: string, orderedIds: string[]): CategoryTree[] {
	return categories.map(category => {
		if (category.id === categoryId) return { ...category, items: orderById(category.items, orderedIds) }
		return {
			...category,
			children: category.children.map(child =>
				child.id === categoryId ? { ...child, items: orderById(child.items, orderedIds) } : child,
			),
		}
	})
}

function removeItemFromTree(categories: CategoryTree[], itemId: string): { categories: CategoryTree[]; item: Item | null } {
	let removed: Item | null = null
	const stripFrom = (items: Item[]) =>
		items.filter(item => {
			if (item.id !== itemId) return true
			removed = item
			return false
		})

	const next = categories.map(category => ({
		...category,
		items: stripFrom(category.items),
		children: category.children.map(child => ({ ...child, items: stripFrom(child.items) })),
	}))

	return { categories: next, item: removed }
}

function insertItemIntoCategory(categories: CategoryTree[], categoryId: string, item: Item, index: number): CategoryTree[] {
	const insertAt = (items: Item[]) => {
		const clamped = Math.max(0, Math.min(index, items.length))
		const next = [...items]
		next.splice(clamped, 0, item)
		return next
	}

	return categories.map(category => {
		if (category.id === categoryId) return { ...category, items: insertAt(category.items) }
		return {
			...category,
			children: category.children.map(child => (child.id === categoryId ? { ...child, items: insertAt(child.items) } : child)),
		}
	})
}

function reorderCategoriesInTree(categories: CategoryTree[], parentId: string | null, orderedIds: string[]): CategoryTree[] {
	if (parentId === null) return orderById(categories, orderedIds)

	return categories.map(category => {
		if (category.id !== parentId) return category
		return { ...category, children: orderById(category.children, orderedIds) }
	})
}

export function listReducer(state: ListWithContent, action: ListAction): ListWithContent {
	switch (action.type) {
		case 'replace':
			return action.list

		case 'toggleItem':
			return {
				...state,
				categories: mapAllItems(state.categories, item =>
					item.id === action.itemId ? { ...item, packed: action.packed } : item,
				),
			}

		case 'updateItem':
			return {
				...state,
				categories: mapAllItems(state.categories, item =>
					item.id === action.itemId ? { ...item, ...action.patch } : item,
				),
			}

		case 'addItem':
			return { ...state, categories: addItemToCategory(state.categories, action.categoryId, action.item) }

		case 'removeItem':
			return {
				...state,
				categories: mapAllItems(state.categories, item => (item.id === action.itemId ? null : item)),
			}

		case 'confirmItem':
			return {
				...state,
				categories: mapAllItems(state.categories, item => (item.id === action.tempId ? action.item : item)),
			}

		case 'addCategory':
			return { ...state, categories: addCategoryToTree(state.categories, action.category) }

		case 'renameCategory':
			return { ...state, categories: renameCategoryInTree(state.categories, action.categoryId, action.name) }

		case 'removeCategory':
			return { ...state, categories: removeCategoryFromTree(state.categories, action.categoryId) }

		case 'addPerson':
			return { ...state, persons: [...state.persons, action.person] }

		case 'renamePerson':
			return {
				...state,
				persons: state.persons.map(person =>
					person.id === action.personId ? { ...person, name: action.name } : person,
				),
			}

		case 'removePerson':
			return { ...state, persons: state.persons.filter(person => person.id !== action.personId) }

		case 'resetPacked':
			return { ...state, categories: mapAllItems(state.categories, item => ({ ...item, packed: false })) }

		case 'reorderItems':
			return { ...state, categories: reorderItemsInCategory(state.categories, action.categoryId, action.orderedIds) }

		case 'moveItem': {
			const { categories: withoutItem, item } = removeItemFromTree(state.categories, action.itemId)
			if (!item) return state
			const moved = { ...item, categoryId: action.toCategoryId }
			return { ...state, categories: insertItemIntoCategory(withoutItem, action.toCategoryId, moved, action.index) }
		}

		case 'reorderCategories':
			return { ...state, categories: reorderCategoriesInTree(state.categories, action.parentId, action.orderedIds) }

		default:
			return state
	}
}
