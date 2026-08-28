import { useEffect, useRef } from 'react'
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import type { CategoryTree } from '@/lib/dal/tree'
import type { Item } from '@/lib/db/schema'

export type ItemDragData = {
	type: 'item'
	itemId: string
	categoryId: string
	instanceId: symbol
}

export type CategoryDragData = {
	type: 'category'
	categoryId: string
	parentId: string | null
	instanceId: symbol
}

type DragData = ItemDragData | CategoryDragData

function isItemDragData(data: Record<string | symbol, unknown>): data is ItemDragData {
	return data.type === 'item'
}

function isCategoryDragData(data: Record<string | symbol, unknown>): data is CategoryDragData {
	return data.type === 'category'
}

function findCategorySiblings(categories: CategoryTree[], parentId: string | null): Array<{ id: string }> | null {
	if (parentId === null) return categories
	const parent = categories.find(category => category.id === parentId)
	return parent ? parent.children : null
}

function findCategoryItems(categories: CategoryTree[], categoryId: string): Item[] | null {
	for (const category of categories) {
		if (category.id === categoryId) return category.items
		const child = category.children.find(candidate => candidate.id === categoryId)
		if (child) return child.items
	}
	return null
}

export type ListDndActions = {
	reorderItems: (categoryId: string, orderedIds: string[]) => void
	moveItem: (itemId: string, toCategoryId: string, index: number, orderedIdsAtDestination: string[]) => void
	reorderCategories: (parentId: string | null, orderedIds: string[]) => void
}

export function useListDnd(
	instanceId: symbol | null,
	categories: CategoryTree[],
	actions: ListDndActions,
): void {
	const categoriesRef = useRef(categories)
	useEffect(() => {
		categoriesRef.current = categories
	}, [categories])

	const actionsRef = useRef(actions)
	useEffect(() => {
		actionsRef.current = actions
	}, [actions])

	useEffect(() => {
		if (instanceId === null) return

		return monitorForElements({
			canMonitor: ({ source }) => source.data.instanceId === instanceId,
			onDrop({ location, source }) {
				const dropTargets = location.current.dropTargets
				if (dropTargets.length === 0) return

				const sourceData = source.data as DragData

				if (isCategoryDragData(sourceData)) {
					const [target] = dropTargets
					if (target.data.type !== 'category') return
					const parentId = sourceData.parentId
					if (target.data.parentId !== parentId) return

					const siblings = findCategorySiblings(categoriesRef.current, parentId)
					if (!siblings) return

					const startIndex = siblings.findIndex(category => category.id === sourceData.categoryId)
					const indexOfTarget = siblings.findIndex(category => category.id === target.data.categoryId)
					if (startIndex === -1 || indexOfTarget === -1) return

					const closestEdge = extractClosestEdge(target.data)
					const finishIndex = getReorderDestinationIndex({
						startIndex,
						indexOfTarget,
						closestEdgeOfTarget: closestEdge,
						axis: 'vertical',
					})
					if (finishIndex === startIndex) return

					const reordered = reorder({ list: siblings.map(category => category.id), startIndex, finishIndex })
					actionsRef.current.reorderCategories(parentId, reordered)
					return
				}

				if (!isItemDragData(sourceData)) return

				const sourceCategoryId = sourceData.categoryId
				const sourceItems = findCategoryItems(categoriesRef.current, sourceCategoryId)
				if (!sourceItems) return
				const startIndex = sourceItems.findIndex(item => item.id === sourceData.itemId)
				if (startIndex === -1) return

				let destinationCategoryId: string
				let destinationItemId: string | null = null
				let closestEdge: Edge | null = null

				if (dropTargets.length === 1) {
					const [only] = dropTargets
					if (only.data.type === 'item') {
						destinationCategoryId = only.data.categoryId as string
						destinationItemId = only.data.itemId as string
						closestEdge = extractClosestEdge(only.data)
					} else if (only.data.type === 'category-body') {
						destinationCategoryId = only.data.categoryId as string
					} else {
						return
					}
				} else {
					const [itemTarget, bodyTarget] = dropTargets
					if (itemTarget.data.type !== 'item' || bodyTarget.data.type !== 'category-body') return
					destinationCategoryId = bodyTarget.data.categoryId as string
					destinationItemId = itemTarget.data.itemId as string
					closestEdge = extractClosestEdge(itemTarget.data)
				}

				const destinationItems = findCategoryItems(categoriesRef.current, destinationCategoryId)
				if (!destinationItems) return

				if (sourceCategoryId === destinationCategoryId) {
					const indexOfTarget = destinationItemId
						? destinationItems.findIndex(item => item.id === destinationItemId)
						: destinationItems.length - 1
					if (indexOfTarget === -1) return

					const finishIndex = getReorderDestinationIndex({
						startIndex,
						indexOfTarget,
						closestEdgeOfTarget: closestEdge,
						axis: 'vertical',
					})
					if (finishIndex === startIndex) return

					const reordered = reorder({ list: sourceItems.map(item => item.id), startIndex, finishIndex })
					actionsRef.current.reorderItems(sourceCategoryId, reordered)
					return
				}

				let insertIndex: number
				if (destinationItemId) {
					const indexOfTarget = destinationItems.findIndex(item => item.id === destinationItemId)
					insertIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget
				} else {
					insertIndex = destinationItems.length
				}

				const destinationOrderedIds = destinationItems.map(item => item.id)
				destinationOrderedIds.splice(insertIndex, 0, sourceData.itemId)
				actionsRef.current.moveItem(sourceData.itemId, destinationCategoryId, insertIndex, destinationOrderedIds)
			},
		})
	}, [instanceId])
}

export function useListAutoScroll(instanceId: symbol | null): void {
	useEffect(() => {
		if (instanceId === null) return

		const viewport = document.querySelector<HTMLElement>('[data-overlayscrollbars-viewport]')
		if (!viewport) return

		return autoScrollForElements({
			element: viewport,
			canScroll: ({ source }) => source.data.instanceId === instanceId,
		})
	}, [instanceId])
}
