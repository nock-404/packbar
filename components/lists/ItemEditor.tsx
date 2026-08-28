'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TextArea } from '@/components/ui/TextArea'
import { useListActions } from './ListActionsContext'
import type { Item } from '@/lib/db/schema'

const NO_PERSON = '__none__'

type ItemEditorProps = {
	item: Item
	onClose: () => void
}

export function ItemEditor({ item, onClose }: ItemEditorProps) {
	const t = useTranslations('list')
	const tCommon = useTranslations('common')
	const { updateItem, persons } = useListActions()

	const [name, setName] = useState(item.name)
	const [quantity, setQuantity] = useState(item.quantity !== null ? String(item.quantity) : '')
	const [note, setNote] = useState(item.note ?? '')
	const [lastMinute, setLastMinute] = useState(item.lastMinute)
	const [personId, setPersonId] = useState(item.personId ?? NO_PERSON)

	const onSave = () => {
		const trimmedName = name.trim()
		const trimmedNote = note.trim()
		const parsedQuantity = quantity.trim().length > 0 ? Number(quantity) : null

		updateItem(item.id, {
			name: trimmedName.length > 0 ? trimmedName : item.name,
			quantity: parsedQuantity !== null && Number.isFinite(parsedQuantity) ? parsedQuantity : null,
			note: trimmedNote.length > 0 ? trimmedNote : null,
			lastMinute,
			personId: personId === NO_PERSON ? null : personId,
		})
		onClose()
	}

	return (
		<Dialog
			open
			onClose={onClose}
			title={t('itemEditor.title')}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						{tCommon('cancel')}
					</Button>
					<Button onClick={onSave}>{tCommon('confirm')}</Button>
				</>
			}
		>
			<div className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="item-editor-name" className="text-sm font-medium text-ink">
						{t('itemEditor.nameLabel')}
					</label>
					<Input id="item-editor-name" value={name} onChange={event => setName(event.target.value)} autoFocus />
				</div>
				<div className="space-y-1.5">
					<label htmlFor="item-editor-quantity" className="text-sm font-medium text-ink">
						{t('itemEditor.quantityLabel')}
					</label>
					<Input
						id="item-editor-quantity"
						type="number"
						min={1}
						value={quantity}
						onChange={event => setQuantity(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="item-editor-note" className="text-sm font-medium text-ink">
						{t('itemEditor.noteLabel')}
					</label>
					<TextArea id="item-editor-note" value={note} onChange={event => setNote(event.target.value)} />
				</div>
				<label className="flex items-start gap-2.5">
					<Checkbox checked={lastMinute} onCheckedChange={setLastMinute} />
					<span className="space-y-0.5">
						<span className="block text-sm font-medium text-ink">{t('itemEditor.lastMinuteLabel')}</span>
						<span className="block text-xs text-ink-muted">{t('itemEditor.lastMinuteHint')}</span>
					</span>
				</label>
				{persons.length > 0 && (
					<div className="space-y-1.5">
						<label htmlFor="item-editor-person" className="text-sm font-medium text-ink">
							{t('itemEditor.personLabel')}
						</label>
						<Select
							id="item-editor-person"
							value={personId}
							onChange={event => setPersonId(event.target.value)}
							options={[
								{ value: NO_PERSON, label: t('itemEditor.noPerson') },
								...persons.map(person => ({ value: person.id, label: person.name })),
							]}
						/>
						<button
							type="button"
							title={t('itemEditor.managePersonsComingSoon')}
							aria-disabled="true"
							onClick={event => event.preventDefault()}
							className="cursor-not-allowed text-xs text-ink-faint underline decoration-dotted"
						>
							{t('itemEditor.managePersons')}
						</button>
					</div>
				)}
			</div>
		</Dialog>
	)
}
