'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { updateList } from '@/app/actions/lists'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import type { ListSummary } from '@/lib/dal/lists'

type RenameListDialogProps = {
	list: ListSummary
	open: boolean
	onClose: () => void
}

export function RenameListDialog({ list, open, onClose }: RenameListDialogProps) {
	const t = useTranslations('dashboard.rename')
	const tCommon = useTranslations('common')

	const [loading, setLoading] = useState(false)

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const name = new FormData(event.currentTarget).get('name')
		if (typeof name !== 'string' || name.trim().length === 0) return

		setLoading(true)
		await updateList(list.id, { name })
		setLoading(false)
		onClose()
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={t('title')}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						{tCommon('cancel')}
					</Button>
					<Button type="submit" form="rename-list-form" loading={loading}>
						{t('save')}
					</Button>
				</>
			}
		>
			<form id="rename-list-form" onSubmit={onSubmit} className="space-y-1.5">
				<label htmlFor="rename-list-name" className="text-sm font-medium text-ink">
					{t('nameLabel')}
				</label>
				<Input id="rename-list-name" name="name" defaultValue={list.name} required autoFocus />
			</form>
		</Dialog>
	)
}
