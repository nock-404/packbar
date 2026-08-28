import type { NewCategory, NewItem, NewPerson } from './db/schema'

export interface TemplateItem {
	name: string
	quantity?: number
	note?: string
	lastMinute?: boolean
}

export interface TemplateSubcategory {
	name: string
	items: TemplateItem[]
}

export interface TemplateCategory {
	name: string
	items: TemplateItem[]
	children?: TemplateSubcategory[]
}

export interface ContentRows {
	categories: NewCategory[]
	items: NewItem[]
	persons: NewPerson[]
}

function itemRow(categoryId: string, tpl: TemplateItem, sortOrder: number): NewItem {
	return {
		id: crypto.randomUUID(),
		categoryId,
		name: tpl.name,
		quantity: tpl.quantity ?? null,
		note: tpl.note ?? null,
		lastMinute: tpl.lastMinute ?? false,
		packed: false,
		personId: null,
		sortOrder,
	}
}

export function filterTemplate(template: TemplateCategory[], categoryNames: string[]): TemplateCategory[] {
	const allowed = new Set(categoryNames)
	return template.filter(category => allowed.has(category.name))
}

export function templateToRows(listId: string, template: TemplateCategory[]): ContentRows {
	const categories: NewCategory[] = []
	const items: NewItem[] = []

	template.forEach((cat, catIdx) => {
		const catId = crypto.randomUUID()
		categories.push({ id: catId, listId, parentId: null, name: cat.name, sortOrder: catIdx })
		cat.items.forEach((tpl, idx) => items.push(itemRow(catId, tpl, idx)))
		;(cat.children ?? []).forEach((sub, subIdx) => {
			const subId = crypto.randomUUID()
			categories.push({ id: subId, listId, parentId: catId, name: sub.name, sortOrder: subIdx })
			sub.items.forEach((tpl, idx) => items.push(itemRow(subId, tpl, idx)))
		})
	})

	return { categories, items, persons: [] }
}

interface SourceItem {
	name: string
	quantity: number | null
	note: string | null
	lastMinute: boolean
	packed: boolean
	personId: string | null
	sortOrder: number
}

interface SourceCategory {
	name: string
	sortOrder: number
	items: SourceItem[]
	children?: { name: string; sortOrder: number; items: SourceItem[] }[]
}

interface SourceContent {
	persons: { id: string; name: string; sortOrder: number }[]
	categories: SourceCategory[]
}

interface CopyOptions {
	resetPacked: boolean
	includePersons: boolean
}

export function contentToRows(listId: string, source: SourceContent, opts: CopyOptions): ContentRows {
	const personMap = new Map<string, string>()
	const persons: NewPerson[] = opts.includePersons
		? source.persons.map(p => {
			const id = crypto.randomUUID()
			personMap.set(p.id, id)
			return { id, listId, name: p.name, sortOrder: p.sortOrder }
		})
		: []

	const categories: NewCategory[] = []
	const items: NewItem[] = []

	const copyItem = (categoryId: string, src: SourceItem): NewItem => ({
		id: crypto.randomUUID(),
		categoryId,
		name: src.name,
		quantity: src.quantity,
		note: src.note,
		lastMinute: src.lastMinute,
		packed: opts.resetPacked ? false : src.packed,
		personId: src.personId ? personMap.get(src.personId) ?? null : null,
		sortOrder: src.sortOrder,
	})

	for (const cat of source.categories) {
		const catId = crypto.randomUUID()
		categories.push({ id: catId, listId, parentId: null, name: cat.name, sortOrder: cat.sortOrder })
		cat.items.forEach(src => items.push(copyItem(catId, src)))
		for (const sub of cat.children ?? []) {
			const subId = crypto.randomUUID()
			categories.push({ id: subId, listId, parentId: catId, name: sub.name, sortOrder: sub.sortOrder })
			sub.items.forEach(src => items.push(copyItem(subId, src)))
		}
	}

	return { categories, items, persons }
}
