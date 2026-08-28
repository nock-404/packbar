'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbClipboardPlus, TbDots, TbFolderPlus, TbGripVertical, TbPencil, TbTrash } from 'react-icons/tb'
import { attachClosestEdge, extractClosestEdge, type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dropdown } from '@/components/ui/Dropdown'
import { IconButton } from '@/components/ui/IconButton'
import { Progress } from '@/components/ui/Progress'
import { categoryProgress } from '@/lib/progress'
import { cx } from '@/lib/cx'
import { AddCategoryButton } from './AddCategoryButton'
import { AddItemInput } from './AddItemInput'
import type { CategoryDragData } from './dnd'
import { DropIndicator } from './DropIndicator'
import { InlineEdit } from './InlineEdit'
import { ItemRow } from './ItemRow'
import { useListActions } from './ListActionsContext'
import type { CategoryTree } from '@/lib/dal/tree'

export type CategoryVisibility = {
	itemIds: Set<string>
	categoryIds: Set<string>
}

type CategorySectionProps = {
	category: CategoryTree
	index: number
	mainCount?: number
	parentLabel?: string
	visibility?: CategoryVisibility | null
}

export function CategorySection({ category, index, mainCount, parentLabel, visibility = null }: CategorySectionProps) {
	const t = useTranslations('list')
	const { editable, canManageCategories, renameCategory, removeCategory, openImport, dndInstanceId } = useListActions()
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [addingSubcategory, setAddingSubcategory] = useState(false)
	const [renameSignal, setRenameSignal] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
	const rootRef = useRef<HTMLElement | HTMLDivElement>(null)
	const handleRef = useRef<HTMLSpanElement>(null)
	const bodyRef = useRef<HTMLDivElement>(null)

	const isMain = category.parentId === null
	const hasChildren = isMain && category.children.length > 0

	useEffect(() => {
		if (!dndInstanceId) return
		const element = rootRef.current
		const handle = handleRef.current
		if (!element || !handle) return

		const dragData: CategoryDragData = {
			type: 'category',
			categoryId: category.id,
			parentId: category.parentId,
			instanceId: dndInstanceId,
		}

		return combine(
			draggable({
				element,
				dragHandle: handle,
				getInitialData: () => dragData,
				onDragStart: () => setIsDragging(true),
				onDrop: () => setIsDragging(false),
			}),
			dropTargetForElements({
				element,
				canDrop: ({ source }) =>
					source.data.type === 'category' && source.data.instanceId === dndInstanceId && source.data.parentId === category.parentId,
				getIsSticky: () => true,
				getData: ({ input, element }) =>
					attachClosestEdge(
						{ type: 'category', categoryId: category.id, parentId: category.parentId },
						{ input, element, allowedEdges: ['top', 'bottom'] },
					),
				onDragEnter: args => {
					if (args.source.data.categoryId !== category.id) setClosestEdge(extractClosestEdge(args.self.data))
				},
				onDrag: args => {
					if (args.source.data.categoryId !== category.id) setClosestEdge(extractClosestEdge(args.self.data))
				},
				onDragLeave: () => setClosestEdge(null),
				onDrop: () => setClosestEdge(null),
			}),
		)
	}, [dndInstanceId, category.id, category.parentId])

	useEffect(() => {
		if (!dndInstanceId) return
		const element = bodyRef.current
		if (!element) return

		return dropTargetForElements({
			element,
			canDrop: ({ source }) => source.data.type === 'item' && source.data.instanceId === dndInstanceId,
			getIsSticky: () => true,
			getData: () => ({ type: 'category-body', categoryId: category.id }),
		})
	}, [dndInstanceId, category.id, hasChildren, editable])

	const number = parentLabel ? `${parentLabel}.${index + 1}` : String(index + 1).padStart(2, '0')
	const eyebrow = isMain && mainCount !== undefined ? `${number} / ${String(mainCount).padStart(2, '0')}` : number
	const progress = categoryProgress(category)

	const visibleItems = visibility ? category.items.filter(item => visibility.itemIds.has(item.id)) : category.items
	const visibleChildren = visibility
		? category.children.filter(child => visibility.categoryIds.has(child.id))
		: category.children

	const onDelete = () => {
		removeCategory(category.id)
		setConfirmOpen(false)
	}

	const menu = canManageCategories && (
		<Dropdown
			trigger={
				<IconButton label={t('categoryMenu.label')}>
					<TbDots />
				</IconButton>
			}
			items={[
				...(isMain
					? [
							{
								icon: <TbFolderPlus />,
								label: t('categoryMenu.addSubcategory'),
								onSelect: () => setAddingSubcategory(true),
							},
						]
					: []),
				...(openImport
					? [
							{
								icon: <TbClipboardPlus />,
								label: t('categoryMenu.import'),
								onSelect: () => openImport(category.id),
							},
						]
					: []),
				{ icon: <TbPencil />, label: t('categoryMenu.rename'), onSelect: () => setRenameSignal(s => s + 1) },
				{ icon: <TbTrash />, label: t('categoryMenu.delete'), onSelect: () => setConfirmOpen(true), destructive: true },
			]}
		/>
	)

	const header = (
		<div className={cx('flex items-start justify-between gap-3 px-4 sm:px-5', isMain ? 'pt-4 pb-3' : 'pt-3.5 pb-2')}>
			<div className="flex min-w-0 flex-1 items-start gap-2">
				{dndInstanceId && (
					<span
						ref={handleRef}
						role="img"
						aria-label={t('dnd.categoryHandle')}
						className="mt-0.5 flex size-5 shrink-0 cursor-grab items-center justify-center text-ink-faint/60 active:cursor-grabbing"
					>
						<TbGripVertical className="size-4" />
					</span>
				)}
				<div className="min-w-0 flex-1 space-y-0.5">
					<p className="font-mono text-[0.625rem] tracking-[0.2em] text-ink-faint uppercase tabular-nums">{eyebrow}</p>
					<InlineEdit
						as={isMain ? 'h2' : 'h3'}
						value={category.name}
						onSave={name => renameCategory(category.id, name)}
						editTrigger={renameSignal}
						disabled={!canManageCategories}
						ariaLabel={t('categoryNameLabel')}
						className={cx('font-display font-semibold text-ink', isMain ? 'text-lg' : 'text-sm')}
					/>
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2.5 pt-0.5">
				{progress.total > 0 && (
					<div className="flex items-center gap-2">
						<Progress
							value={progress.packed}
							max={progress.total}
							size="sm"
							className={cx('hidden sm:block', isMain ? 'w-16' : 'w-12')}
						/>
						<p className="font-mono text-xs whitespace-nowrap text-ink-muted tabular-nums">
							{progress.packed}/{progress.total}
						</p>
					</div>
				)}
				{menu}
			</div>
		</div>
	)

	if (!isMain) {
		return (
			<div ref={rootRef as React.RefObject<HTMLDivElement>} className={cx('relative border-t border-line', isDragging && 'opacity-40')}>
				{header}
				{visibleItems.length > 0 && (
					<ul className="divide-y divide-line/70 border-t border-line/70">
						{visibleItems.map(item => (
							<ItemRow key={item.id} item={item} />
						))}
					</ul>
				)}
				{editable && (
					<div ref={bodyRef}>
						<AddItemInput categoryId={category.id} variant="ghost" />
					</div>
				)}
				<DropIndicator edge={closestEdge} />
				<ConfirmDialog
					open={confirmOpen}
					onClose={() => setConfirmOpen(false)}
					onConfirm={onDelete}
					title={t('deleteCategoryConfirm.title')}
					message={t('deleteCategoryConfirm.message', { name: category.name, count: progress.total })}
					confirmLabel={t('deleteCategoryConfirm.confirm')}
					destructive
				/>
			</div>
		)
	}

	return (
		<section
			ref={rootRef as React.RefObject<HTMLElement>}
			className={cx(
				'relative overflow-hidden rounded-lg border border-line bg-surface-raised shadow-sm shadow-black/10',
				isDragging && 'opacity-40',
			)}
		>
			{header}
			{visibleItems.length > 0 && (
				<ul className="divide-y divide-line/70 border-t border-line/70">
					{visibleItems.map(item => (
						<ItemRow key={item.id} item={item} />
					))}
				</ul>
			)}
			{editable && hasChildren && (
				<div ref={bodyRef}>
					<AddItemInput categoryId={category.id} variant="ghost" />
				</div>
			)}
			{visibleChildren.length > 0 && (
				<div>
					{category.children.map((child, childIndex) => {
						if (visibility && !visibility.categoryIds.has(child.id)) return null
						return (
							<CategorySection
								key={child.id}
								category={{ ...child, children: [] }}
								index={childIndex}
								parentLabel={number}
								visibility={visibility}
							/>
						)
					})}
				</div>
			)}
			{canManageCategories && addingSubcategory && (
				<div className="border-t border-line px-4 py-3 sm:px-5">
					<AddCategoryButton
						parentId={category.id}
						label={t('categoryMenu.addSubcategory')}
						open
						onOpenChange={setAddingSubcategory}
					/>
				</div>
			)}
			{editable && !hasChildren ? (
				<div ref={bodyRef}>
					<div className="relative">
						<div className="perforation" />
						<span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
						<span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
					</div>
					<AddItemInput categoryId={category.id} variant="foot" />
				</div>
			) : (
				<div className="pb-2" />
			)}
			<DropIndicator edge={closestEdge} />
			<ConfirmDialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={onDelete}
				title={t('deleteCategoryConfirm.title')}
				message={t('deleteCategoryConfirm.message', { name: category.name, count: progress.total })}
				confirmLabel={t('deleteCategoryConfirm.confirm')}
				destructive
			/>
		</section>
	)
}
