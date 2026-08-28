'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { saveAsTemplate } from '@/app/actions/lists'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'

type SaveAsTemplateDialogProps = {
	listId: string
	defaultName: string
	onClose: () => void
}

export function SaveAsTemplateDialog({ listId, defaultName, onClose }: SaveAsTemplateDialogProps) {
	const t = useTranslations('list.settings.template')
	const tCommon = useTranslations('common')
	const router = useRouter()

	const [name, setName] = useState(defaultName)
	const [loading, setLoading] = useState(false)

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const trimmed = name.trim()
		if (trimmed.length === 0) return

		setLoading(true)
		await saveAsTemplate(listId, trimmed)
		setLoading(false)
		router.refresh()
		onClose()
	}

	return (
		<Dialog
			open
			onClose={onClose}
			title={t('dialogTitle')}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						{tCommon('cancel')}
					</Button>
					<Button type="submit" form="save-as-template-form" loading={loading}>
						{t('save')}
					</Button>
				</>
			}
		>
			<form id="save-as-template-form" onSubmit={onSubmit} className="space-y-1.5">
				<label htmlFor="save-as-template-name" className="text-sm font-medium text-ink">
					{t('nameLabel')}
				</label>
				<Input id="save-as-template-name" value={name} onChange={event => setName(event.target.value)} required autoFocus />
			</form>
		</Dialog>
	)
}
