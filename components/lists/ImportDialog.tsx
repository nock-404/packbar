'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { parseImportText, type ImportEntry } from '@/lib/import'

type ImportDialogCategory = { id: string; name: string; depth: 0 | 1 }

type ImportDialogProps = {
	open: boolean
	onClose: () => void
	categories: ImportDialogCategory[]
	onImport: (categoryId: string, entries: ImportEntry[]) => Promise<void>
	initialCategoryId?: string
}

export function ImportDialog({ open, onClose, categories, onImport, initialCategoryId }: ImportDialogProps) {
	const t = useTranslations('import')
	const tCommon = useTranslations('common')

	const [prevOpen, setPrevOpen] = useState(open)
	const [text, setText] = useState('')
	const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	if (open !== prevOpen) {
		setPrevOpen(open)
		if (open) {
			setText('')
			const initial =
				initialCategoryId && categories.some(category => category.id === initialCategoryId)
					? initialCategoryId
					: (categories[0]?.id ?? '')
			setCategoryId(initial)
			setError(false)
		}
	}

	const entries = useMemo(() => parseImportText(text), [text])

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (entries.length === 0 || !categoryId) return

		setError(false)
		setLoading(true)
		try {
			await onImport(categoryId, entries)
			onClose()
		} catch {
			setLoading(false)
			setError(true)
		}
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
					<Button
						type="submit"
						form="import-dialog-form"
						loading={loading}
						disabled={entries.length === 0 || !categoryId}
					>
						{t('submit')}
					</Button>
				</>
			}
		>
			<form id="import-dialog-form" onSubmit={onSubmit} className="space-y-5">
				<div className="space-y-1.5">
					<label htmlFor="import-dialog-text" className="text-sm font-medium text-ink">
						{t('textareaLabel')}
					</label>
					<TextArea
						id="import-dialog-text"
						value={text}
						onChange={event => setText(event.target.value)}
						placeholder={t('textareaPlaceholder')}
						className="min-h-40 font-mono"
						autoFocus
					/>
					<p className="font-mono text-xs text-ink-muted tabular-nums">{t('count', { count: entries.length })}</p>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="import-dialog-category" className="text-sm font-medium text-ink">
						{t('categoryLabel')}
					</label>
					<Select
						id="import-dialog-category"
						value={categoryId}
						onChange={event => setCategoryId(event.target.value)}
						options={categories.map(category => ({
							value: category.id,
							label: category.depth === 1 ? `- ${category.name}` : category.name,
						}))}
					/>
				</div>
				{error && <p className="text-sm text-danger">{t('errorGeneric')}</p>}
			</form>
		</Dialog>
	)
}
