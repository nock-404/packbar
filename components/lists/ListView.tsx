'use client'

import { useCallback, useMemo, useReducer, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbFolderPlus, TbX } from 'react-icons/tb'
import {
	createCategory,
	createItem,
	createItemsBulk,
	createPerson,
	deleteCategory,
	deleteItem,
	deletePerson,
	moveItem as moveItemAction,
	renameCategory,
	renamePerson,
	reorderCategories as reorderCategoriesAction,
	reorderItems as reorderItemsAction,
	updateItem,
} from '@/app/actions/content'
import { resetAllPacked, updateList } from '@/app/actions/lists'
import { createItemByToken, deleteItemByToken, updateItemByToken } from '@/app/actions/share'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddCategoryButton } from './AddCategoryButton'
import { CategorySection, type CategoryVisibility } from './CategorySection'
import { useListAutoScroll, useListDnd } from './dnd'
import { applyFilters, emptyFilters, hasActiveFilters, type Filters } from './filters'
import { ImportDialog } from './ImportDialog'
import { ListActionsContext, type ListActions } from './ListActionsContext'
import { ListHeader } from './ListHeader'
import type { ListSettingsPatch } from './ListSettingsDialog'
import { listReducer } from './listReducer'
import { usePolling } from './usePolling'
import type { ImportEntry } from '@/lib/import'
import type { CategoryTree, ListWithContent } from '@/lib/dal/tree'
import type { Item, Person } from '@/lib/db/schema'

type ListViewProps = {
	initial: ListWithContent
	editable: boolean
	tokenMode: string | null
}

export function ListView({ initial, editable, tokenMode }: ListViewProps) {
	const t = useTranslations('list')
	const [state, dispatch] = useReducer(listReducer, initial)
	const [error, setError] = useState<string | null>(null)
	const [filters, setFilters] = useState<Filters>(emptyFilters)
	const [importOpen, setImportOpen] = useState(false)
	const [importCategoryId, setImportCategoryId] = useState<string | undefined>(undefined)
	const pendingMutations = useRef(0)

	const canManageCategories = editable && !tokenMode

	const filteringActive = hasActiveFilters(filters)
	const visibility: CategoryVisibility | null = useMemo(() => {
		if (!filteringActive) return null
		const filtered = applyFilters(state, filters)
		const itemIds = new Set<string>()
		const categoryIds = new Set<string>()
		for (const category of filtered.categories) {
			categoryIds.add(category.id)
			for (const item of category.items) itemIds.add(item.id)
			for (const child of category.children) {
				categoryIds.add(child.id)
				for (const item of child.items) itemIds.add(item.id)
			}
		}
		return { itemIds, categoryIds }
	}, [filteringActive, state, filters])

	const beginMutation = useCallback(() => {
		pendingMutations.current += 1
	}, [])

	const endMutation = useCallback(() => {
		pendingMutations.current -= 1
	}, [])

	const fetchLatest = useCallback(async (): Promise<ListWithContent | null> => {
		try {
			if (tokenMode) {
				const response = await fetch(`/api/share/${tokenMode}`)
				if (!response.ok) return null
				const body = (await response.json()) as { list: ListWithContent; mode: 'read' | 'edit' }
				return body.list
			}
			const response = await fetch(`/api/lists/${state.id}`)
			if (!response.ok) return null
			return (await response.json()) as ListWithContent
		} catch {
			return null
		}
	}, [tokenMode, state.id])

	const showError = useCallback(
		(message: string) => {
			setError(message)
			void fetchLatest().then(fresh => {
				if (fresh) dispatch({ type: 'replace', list: fresh })
			})
		},
		[fetchLatest],
	)

	usePolling({
		fetcher: fetchLatest,
		enabled: tokenMode !== null || state.shareMode === 'edit',
		onResult: list => dispatch({ type: 'replace', list }),
		isPaused: () => pendingMutations.current > 0,
	})

	const [dndSymbol] = useState(() => Symbol('list-dnd'))
	const dndInstanceId = canManageCategories && !filteringActive ? dndSymbol : null

	const dndReorderItems = useCallback(
		(categoryId: string, orderedIds: string[]) => {
			dispatch({ type: 'reorderItems', categoryId, orderedIds })
			beginMutation()
			reorderItemsAction(categoryId, orderedIds).catch(() => showError(t('errors.update'))).finally(endMutation)
		},
		[beginMutation, endMutation, showError, t],
	)

	const dndMoveItem = useCallback(
		(itemId: string, toCategoryId: string, index: number, orderedIdsAtDestination: string[]) => {
			dispatch({ type: 'moveItem', itemId, toCategoryId, index })
			beginMutation()
			moveItemAction(itemId, toCategoryId, index)
				.then(() => reorderItemsAction(toCategoryId, orderedIdsAtDestination))
				.catch(() => showError(t('errors.update')))
				.finally(endMutation)
		},
		[beginMutation, endMutation, showError, t],
	)

	const dndReorderCategories = useCallback(
		(parentId: string | null, orderedIds: string[]) => {
			dispatch({ type: 'reorderCategories', parentId, orderedIds })
			beginMutation()
			reorderCategoriesAction(state.id, orderedIds, parentId)
				.catch(() => showError(t('errors.update')))
				.finally(endMutation)
		},
		[beginMutation, endMutation, showError, t, state.id],
	)

	const dndActions = useMemo(
		() => ({ reorderItems: dndReorderItems, moveItem: dndMoveItem, reorderCategories: dndReorderCategories }),
		[dndReorderItems, dndMoveItem, dndReorderCategories],
	)

	useListDnd(dndInstanceId, state.categories, dndActions)
	useListAutoScroll(dndInstanceId)

	const openImport = useCallback((categoryId?: string) => {
		setImportCategoryId(categoryId)
		setImportOpen(true)
	}, [])

	const onImport = async (categoryId: string, entries: ImportEntry[]) => {
		beginMutation()
		try {
			await createItemsBulk(categoryId, entries)
			const fresh = await fetchLatest()
			if (fresh) dispatch({ type: 'replace', list: fresh })
		} finally {
			endMutation()
		}
	}

	const importCategories = state.categories.flatMap(category => [
		{ id: category.id, name: category.name, depth: 0 as const },
		...category.children.map(child => ({ id: child.id, name: child.name, depth: 1 as const })),
	])

	const actions: ListActions = useMemo(() => {
		const listId = state.id

		return {
			editable,
			tokenMode,
			persons: state.persons,
			canManageCategories,
			dndInstanceId,

			toggleItem: (itemId, packed) => {
				dispatch({ type: 'toggleItem', itemId, packed })
				beginMutation()
				const request = tokenMode ? updateItemByToken(tokenMode, itemId, { packed }) : updateItem(itemId, { packed })
				request.catch(() => showError(t('errors.update'))).finally(endMutation)
			},

			updateItem: (itemId, patch) => {
				dispatch({ type: 'updateItem', itemId, patch })
				beginMutation()
				const request = tokenMode ? updateItemByToken(tokenMode, itemId, patch) : updateItem(itemId, patch)
				request.catch(() => showError(t('errors.update'))).finally(endMutation)
			},

			addItem: (categoryId, name) => {
				const tempId = crypto.randomUUID()
				const tempItem: Item = {
					id: tempId,
					categoryId,
					name,
					quantity: null,
					note: null,
					lastMinute: false,
					packed: false,
					personId: null,
					sortOrder: 0,
				}
				dispatch({ type: 'addItem', categoryId, item: tempItem })
				beginMutation()
				const request = tokenMode ? createItemByToken(tokenMode, categoryId, name) : createItem(categoryId, name)
				request
					.then(item => dispatch({ type: 'confirmItem', tempId, item }))
					.catch(() => showError(t('errors.add')))
					.finally(endMutation)
			},

			removeItem: itemId => {
				dispatch({ type: 'removeItem', itemId })
				beginMutation()
				const request = tokenMode ? deleteItemByToken(tokenMode, itemId) : deleteItem(itemId)
				request.catch(() => showError(t('errors.remove'))).finally(endMutation)
			},

			addCategory: (name, parentId) => {
				const tempId = crypto.randomUUID()
				const tempCategory: CategoryTree = {
					id: tempId,
					listId,
					parentId,
					name,
					sortOrder: 0,
					items: [],
					children: [],
				}
				dispatch({ type: 'addCategory', category: tempCategory })
				beginMutation()
				createCategory(listId, name, parentId)
					.then(category => {
						dispatch({ type: 'removeCategory', categoryId: tempId })
						dispatch({ type: 'addCategory', category: { ...category, items: [], children: [] } })
					})
					.catch(() => showError(t('errors.addCategory')))
					.finally(endMutation)
			},

			renameCategory: (categoryId, name) => {
				dispatch({ type: 'renameCategory', categoryId, name })
				beginMutation()
				renameCategory(categoryId, name).catch(() => showError(t('errors.update'))).finally(endMutation)
			},

			removeCategory: categoryId => {
				dispatch({ type: 'removeCategory', categoryId })
				beginMutation()
				deleteCategory(categoryId).catch(() => showError(t('errors.remove'))).finally(endMutation)
			},

			addPerson: name => {
				const tempId = crypto.randomUUID()
				const tempPerson: Person = { id: tempId, listId, name, sortOrder: 0 }
				dispatch({ type: 'addPerson', person: tempPerson })
				beginMutation()
				createPerson(listId, name)
					.then(person => {
						dispatch({ type: 'removePerson', personId: tempId })
						dispatch({ type: 'addPerson', person })
					})
					.catch(() => showError(t('errors.addPerson')))
					.finally(endMutation)
			},

			renamePerson: (personId, name) => {
				dispatch({ type: 'renamePerson', personId, name })
				beginMutation()
				renamePerson(personId, name).catch(() => showError(t('errors.update'))).finally(endMutation)
			},

			removePerson: personId => {
				dispatch({ type: 'removePerson', personId })
				beginMutation()
				deletePerson(personId).catch(() => showError(t('errors.remove'))).finally(endMutation)
			},

			openImport: canManageCategories ? openImport : undefined,
		}
	}, [editable, tokenMode, canManageCategories, dndInstanceId, state.id, state.persons, beginMutation, endMutation, showError, openImport, t])

	const onRenameList = (name: string) => {
		dispatch({ type: 'replace', list: { ...state, name } })
		beginMutation()
		updateList(state.id, { name }).catch(() => showError(t('errors.update'))).finally(endMutation)
	}

	const onSaveSettings = (patch: ListSettingsPatch) => {
		dispatch({ type: 'replace', list: { ...state, ...patch } })
		beginMutation()
		updateList(state.id, patch).catch(() => showError(t('errors.update'))).finally(endMutation)
	}

	const onResetPacked = () => {
		dispatch({ type: 'resetPacked' })
		beginMutation()
		resetAllPacked(state.id).catch(() => showError(t('errors.update'))).finally(endMutation)
	}

	const onShareModeChange = (shareMode: ListWithContent['shareMode'], shareToken: string | null) => {
		dispatch({ type: 'replace', list: { ...state, shareMode, shareToken } })
	}

	const visibleMainCategories = state.categories.filter(
		category => !filteringActive || visibility!.categoryIds.has(category.id),
	)

	return (
		<ListActionsContext.Provider value={actions}>
			<div className="mx-auto w-full max-w-3xl space-y-8 pb-16 xl:max-w-5xl">
				<ListHeader
					list={state}
					editable={editable}
					tokenMode={tokenMode}
					filters={filters}
					onFiltersChange={setFilters}
					onRenameList={onRenameList}
					onResetPacked={onResetPacked}
					onSaveSettings={onSaveSettings}
					onShareModeChange={onShareModeChange}
					onOpenImport={
						canManageCategories && state.categories.length > 0 ? () => openImport(undefined) : undefined
					}
				/>

				{state.categories.length === 0 ? (
					<div className="rounded-lg border border-line bg-surface-raised">
						<EmptyState
							icon={<TbFolderPlus />}
							title={t('empty.title')}
							description={t('empty.description')}
							action={
								canManageCategories ? <AddCategoryButton parentId={null} label={t('empty.addFirstCategory')} /> : undefined
							}
						/>
					</div>
				) : filteringActive && visibleMainCategories.length === 0 ? (
					<div className="rounded-lg border border-line bg-surface-raised">
						<EmptyState icon={<TbFolderPlus />} title={t('filters.noResultsTitle')} description={t('filters.noResultsDescription')} />
					</div>
				) : (
					<div className="space-y-5">
						{canManageCategories && (
							<div className="flex justify-end">
								<AddCategoryButton parentId={null} label={t('addCategory')} />
							</div>
						)}
						{(() => {
							const visible = state.categories
								.map((category, index) => ({ category, index }))
								.filter(({ category }) => !filteringActive || visibility!.categoryIds.has(category.id))
							const mid = Math.ceil(visible.length / 2)
							const stacks = [visible.slice(0, mid), visible.slice(mid)]
							return (
								<div className="space-y-5 xl:grid xl:grid-cols-2 xl:items-start xl:gap-5 xl:space-y-0">
									{stacks.map((stack, stackIndex) => (
										<div key={stackIndex} className="space-y-5">
											{stack.map(({ category, index }) => (
												<CategorySection
													key={category.id}
													category={category}
													index={index}
													mainCount={state.categories.length}
													visibility={visibility}
												/>
											))}
										</div>
									))}
								</div>
							)
						})()}
						{canManageCategories && <AddCategoryButton parentId={null} label={t('addCategory')} />}
					</div>
				)}

				{canManageCategories && (
					<ImportDialog
						open={importOpen}
						onClose={() => setImportOpen(false)}
						categories={importCategories}
						initialCategoryId={importCategoryId}
						onImport={onImport}
					/>
				)}

				{error && (
					<div role="alert" className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
						<div className="flex items-center gap-3 rounded-md border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger shadow-lg shadow-black/20">
							<span>{error}</span>
							<button
								type="button"
								onClick={() => setError(null)}
								className="inline-flex rounded-sm p-0.5 outline-none hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-danger/40"
							>
								<TbX className="size-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</ListActionsContext.Provider>
	)
}
