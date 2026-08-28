'use client'

import { useState, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { TbTrash } from 'react-icons/tb'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { InlineEdit } from './InlineEdit'
import { useListActions } from './ListActionsContext'
import type { Person } from '@/lib/db/schema'

export function PersonManager() {
	const t = useTranslations('list.settings.persons')
	const { persons, addPerson, renamePerson, removePerson } = useListActions()
	const [name, setName] = useState('')
	const [confirmTarget, setConfirmTarget] = useState<Person | null>(null)

	// Kein <form>: PersonManager steckt immer in der Form von ListSettingsDialog,
	// verschachtelte <form>-Elemente sind ungueltiges HTML und wuerden das aeussere Formular submitten.
	const submitAdd = () => {
		const trimmed = name.trim()
		if (trimmed.length === 0) return
		addPerson(trimmed)
		setName('')
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			submitAdd()
		}
	}

	return (
		<div className="space-y-3">
			{persons.length === 0 ? (
				<p className="text-sm text-ink-muted">{t('empty')}</p>
			) : (
				<ul className="space-y-0.5">
					{persons.map(person => (
						<li
							key={person.id}
							className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-surface-sunken"
						>
							<InlineEdit
								value={person.name}
								onSave={value => renamePerson(person.id, value)}
								ariaLabel={t('nameLabel')}
								className="text-sm text-ink"
							/>
							<IconButton label={t('delete')} onClick={() => setConfirmTarget(person)}>
								<TbTrash />
							</IconButton>
						</li>
					))}
				</ul>
			)}
			<div className="flex items-center gap-2">
				<Input
					value={name}
					onChange={event => setName(event.target.value)}
					onKeyDown={onKeyDown}
					placeholder={t('addPlaceholder')}
				/>
				<Button type="button" onClick={submitAdd}>
					{t('add')}
				</Button>
			</div>
			<ConfirmDialog
				open={confirmTarget !== null}
				onClose={() => setConfirmTarget(null)}
				onConfirm={() => {
					if (confirmTarget) removePerson(confirmTarget.id)
					setConfirmTarget(null)
				}}
				title={t('deleteConfirm.title')}
				message={confirmTarget ? t('deleteConfirm.message', { name: confirmTarget.name }) : ''}
				confirmLabel={t('delete')}
				destructive
			/>
		</div>
	)
}
