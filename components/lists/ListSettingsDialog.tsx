'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { CoverPicker } from './CoverPicker'
import { PersonManager } from './PersonManager'
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog'
import type { ListWithContent } from '@/lib/dal/tree'
import type { List } from '@/lib/db/schema'

export type ListSettingsPatch = Partial<Pick<List, 'name' | 'destination' | 'tripDate' | 'tripEnd' | 'coverImage'>>

type ListSettingsDialogProps = {
	list: ListWithContent
	onClose: () => void
	onSave: (patch: ListSettingsPatch) => void
}

export function ListSettingsDialog({ list, onClose, onSave }: ListSettingsDialogProps) {
	const t = useTranslations('list.settings')
	const tCommon = useTranslations('common')

	const [name, setName] = useState(list.name)
	const [destination, setDestination] = useState(list.destination ?? '')
	const [tripDate, setTripDate] = useState(list.tripDate ?? '')
	const [tripEnd, setTripEnd] = useState(list.tripEnd ?? '')
	const [coverImage, setCoverImage] = useState<string | null>(list.coverImage)
	const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false)

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const trimmedName = name.trim()
		const trimmedDestination = destination.trim()

		onSave({
			name: trimmedName.length > 0 ? trimmedName : list.name,
			destination: trimmedDestination.length > 0 ? trimmedDestination : null,
			tripDate: tripDate.length > 0 ? tripDate : null,
			tripEnd: tripEnd.length > 0 ? tripEnd : null,
			coverImage,
		})
		onClose()
	}

	return (
		<>
			<Dialog
				open
				onClose={onClose}
				title={t('title')}
				footer={
					<>
						<Button variant="secondary" onClick={onClose}>
							{tCommon('cancel')}
						</Button>
						<Button type="submit" form="list-settings-form">
							{tCommon('confirm')}
						</Button>
					</>
				}
			>
				<form id="list-settings-form" onSubmit={onSubmit} className="space-y-6">
					<div className="space-y-4">
						<h3 className="font-display text-sm font-semibold text-ink">{t('generalTitle')}</h3>
						<div className="space-y-1.5">
							<label htmlFor="settings-name" className="text-sm font-medium text-ink">
								{t('nameLabel')}
							</label>
							<Input id="settings-name" value={name} onChange={event => setName(event.target.value)} required />
						</div>
						<div className="space-y-1.5">
							<label htmlFor="settings-destination" className="text-sm font-medium text-ink">
								{t('destinationLabel')}
							</label>
							<Input id="settings-destination" value={destination} onChange={event => setDestination(event.target.value)} />
						</div>
						<div className="space-y-1.5">
							<span className="text-sm font-medium text-ink">{t('rangeLabel')}</span>
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1">
									<label htmlFor="settings-date" className="text-xs text-ink-muted">
										{t('rangeFrom')}
									</label>
									<Input
										id="settings-date"
										type="date"
										value={tripDate}
										onChange={event => setTripDate(event.target.value)}
									/>
								</div>
								<div className="space-y-1">
									<label htmlFor="settings-date-end" className="text-xs text-ink-muted">
										{t('rangeTo')}
									</label>
									<Input
										id="settings-date-end"
										type="date"
										min={tripDate.length > 0 ? tripDate : undefined}
										value={tripEnd}
										onChange={event => setTripEnd(event.target.value)}
									/>
								</div>
							</div>
						</div>
						<div className="space-y-1.5">
							<span className="text-sm font-medium text-ink">{t('coverLabel')}</span>
							<CoverPicker value={coverImage} onChange={setCoverImage} />
						</div>
					</div>
					<div className="perforation" />
					<div className="space-y-3">
						<h3 className="font-display text-sm font-semibold text-ink">{t('personsTitle')}</h3>
						<PersonManager />
					</div>
					<div className="perforation" />
					<div className="space-y-2">
						<h3 className="font-display text-sm font-semibold text-ink">{t('templateTitle')}</h3>
						<Button type="button" variant="secondary" onClick={() => setSaveAsTemplateOpen(true)}>
							{t('saveAsTemplate')}
						</Button>
					</div>
				</form>
			</Dialog>
			{saveAsTemplateOpen && (
				<SaveAsTemplateDialog listId={list.id} defaultName={list.name} onClose={() => setSaveAsTemplateOpen(false)} />
			)}
		</>
	)
}
