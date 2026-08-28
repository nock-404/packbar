'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { TbCopy, TbDots, TbPencil, TbTrash } from 'react-icons/tb'
import { createList, deleteList } from '@/app/actions/lists'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dropdown } from '@/components/ui/Dropdown'
import { IconButton } from '@/components/ui/IconButton'
import { RenameListDialog } from './RenameListDialog'
import type { ListSummary } from '@/lib/dal/lists'

type ListCardMenuProps = {
	list: ListSummary
	isTemplate?: boolean
	tone?: 'overlay' | 'plain'
}

export function ListCardMenu({ list, isTemplate = false, tone = 'overlay' }: ListCardMenuProps) {
	const t = useTranslations('dashboard')
	const router = useRouter()

	const [renameOpen, setRenameOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [isPending, startTransition] = useTransition()

	const onDuplicate = () => {
		startTransition(async () => {
			const duplicated = await createList(t('menu.duplicateName', { name: list.name }), {
				kind: 'duplicate',
				listId: list.id,
			})
			router.push(`/lists/${duplicated.id}`)
		})
	}

	const onDelete = () => {
		startTransition(async () => {
			await deleteList(list.id)
			setConfirmOpen(false)
		})
	}

	return (
		<>
			<Dropdown
				trigger={
					<IconButton
						label={t('menu.label')}
						disabled={isPending}
						className={tone === 'overlay' ? 'bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white' : undefined}
					>
						<TbDots />
					</IconButton>
				}
				items={[
					{ icon: <TbPencil />, label: t('menu.rename'), onSelect: () => setRenameOpen(true) },
					...(isTemplate
						? []
						: [{ icon: <TbCopy />, label: t('menu.duplicate'), onSelect: onDuplicate }]),
					{ icon: <TbTrash />, label: t('menu.delete'), onSelect: () => setConfirmOpen(true), destructive: true },
				]}
			/>
			<RenameListDialog list={list} open={renameOpen} onClose={() => setRenameOpen(false)} />
			<ConfirmDialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={onDelete}
				title={isTemplate ? t('deleteTemplateConfirm.title') : t('deleteConfirm.title')}
				message={
					isTemplate
						? t('deleteTemplateConfirm.message', { name: list.name })
						: t('deleteConfirm.message', { name: list.name })
				}
				confirmLabel={isTemplate ? t('deleteTemplateConfirm.confirm') : t('deleteConfirm.confirm')}
				destructive
			/>
		</>
	)
}
