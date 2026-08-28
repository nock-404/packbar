'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbClockBolt, TbDots, TbGripVertical, TbPencil, TbTrash } from 'react-icons/tb'
import { attachClosestEdge, extractClosestEdge, type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Dropdown } from '@/components/ui/Dropdown'
import { IconButton } from '@/components/ui/IconButton'
import { cx } from '@/lib/cx'
import { DropIndicator } from './DropIndicator'
import type { ItemDragData } from './dnd'
import { InlineEdit } from './InlineEdit'
import { ItemEditor } from './ItemEditor'
import { useListActions } from './ListActionsContext'
import type { Item } from '@/lib/db/schema'

type ItemRowProps = {
	item: Item
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/)
	const first = parts[0]?.[0] ?? ''
	const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
	return `${first}${second}`.toUpperCase()
}

export function ItemRow({ item }: ItemRowProps) {
	const t = useTranslations('list')
	const { editable, persons, toggleItem, updateItem, removeItem, dndInstanceId } = useListActions()
	const person = item.personId ? persons.find(p => p.id === item.personId) : undefined
	const [editorOpen, setEditorOpen] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
	const rowRef = useRef<HTMLLIElement>(null)
	const handleRef = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		if (!dndInstanceId) return
		const element = rowRef.current
		const handle = handleRef.current
		if (!element || !handle) return

		const dragData: ItemDragData = { type: 'item', itemId: item.id, categoryId: item.categoryId, instanceId: dndInstanceId }

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
				canDrop: ({ source }) => source.data.type === 'item' && source.data.instanceId === dndInstanceId,
				getIsSticky: () => true,
				getData: ({ input, element }) =>
					attachClosestEdge(
						{ type: 'item', itemId: item.id, categoryId: item.categoryId },
						{ input, element, allowedEdges: ['top', 'bottom'] },
					),
				onDragEnter: args => {
					if (args.source.data.itemId !== item.id) setClosestEdge(extractClosestEdge(args.self.data))
				},
				onDrag: args => {
					if (args.source.data.itemId !== item.id) setClosestEdge(extractClosestEdge(args.self.data))
				},
				onDragLeave: () => setClosestEdge(null),
				onDrop: () => setClosestEdge(null),
			}),
		)
	}, [dndInstanceId, item.id, item.categoryId])

	return (
		<li
			ref={rowRef}
			onDoubleClick={() => editable && setEditorOpen(true)}
			className={cx(
				'group relative flex items-center gap-3 px-4 py-2 transition-colors hover:bg-surface-sunken/70 sm:px-5 md:py-1.5',
				isDragging && 'opacity-40',
			)}
		>
			{dndInstanceId && (
				<span
					ref={handleRef}
					role="img"
					aria-label={t('dnd.itemHandle')}
					className="-ml-1 flex size-5 shrink-0 cursor-grab items-center justify-center text-ink-faint/60 active:cursor-grabbing"
				>
					<TbGripVertical className="size-4" />
				</span>
			)}
			<Checkbox
				size="responsive"
				checked={item.packed}
				onCheckedChange={packed => toggleItem(item.id, packed)}
				disabled={!editable}
			/>
			<div className="min-w-0 flex-1 py-0.5">
				<InlineEdit
					value={item.name}
					onSave={name => updateItem(item.id, { name })}
					disabled={!editable}
					ariaLabel={t('itemNameLabel')}
					className={cx(
						'block truncate text-sm text-ink',
						item.packed && 'text-ink-faint line-through decoration-primary/50 decoration-2',
					)}
				/>
				{item.note && (
					<p className={cx('truncate font-mono text-xs', item.packed ? 'text-ink-faint/70' : 'text-ink-faint')}>
						{item.note}
					</p>
				)}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{item.quantity != null && (
					<Badge className={cx('font-mono tabular-nums', item.packed && 'opacity-60')}>{item.quantity}x</Badge>
				)}
				{item.lastMinute && (
					<Badge tone="priority" className={cx(item.packed && 'opacity-60')}>
						<TbClockBolt />
						<span className="hidden sm:inline">{t('lastMinute')}</span>
					</Badge>
				)}
				{person && (
					<span
						title={person.name}
						className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.625rem] font-semibold text-primary"
					>
						{initials(person.name)}
					</span>
				)}
			</div>
			{editable && (
				<div className="-my-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
					<Dropdown
						trigger={
							<IconButton label={t('itemMenu.label')}>
								<TbDots />
							</IconButton>
						}
						items={[
							{ icon: <TbPencil />, label: t('itemMenu.edit'), onSelect: () => setEditorOpen(true) },
							{ icon: <TbTrash />, label: t('itemMenu.delete'), onSelect: () => removeItem(item.id), destructive: true },
						]}
					/>
				</div>
			)}
			{editorOpen && <ItemEditor item={item} onClose={() => setEditorOpen(false)} />}
			<DropIndicator edge={closestEdge} />
		</li>
	)
}
