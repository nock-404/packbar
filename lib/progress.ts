export interface Progress {
	packed: number
	total: number
}

interface HasPacked {
	packed: boolean
}

interface CategoryLike {
	items: HasPacked[]
	children?: { items: HasPacked[] }[]
}

interface ListLike {
	categories: CategoryLike[]
}

export function computeProgress(items: HasPacked[]): Progress {
	return {
		packed: items.filter(i => i.packed).length,
		total: items.length,
	}
}

export function categoryProgress(cat: CategoryLike): Progress {
	const all = [...cat.items, ...(cat.children ?? []).flatMap(c => c.items)]
	return computeProgress(all)
}

export function listProgress(list: ListLike): Progress {
	return list.categories
		.map(categoryProgress)
		.reduce((acc, p) => ({ packed: acc.packed + p.packed, total: acc.total + p.total }), { packed: 0, total: 0 })
}
