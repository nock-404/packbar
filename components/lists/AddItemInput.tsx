'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { TbPlus } from 'react-icons/tb'
import { cx } from '@/lib/cx'
import { useListActions } from './ListActionsContext'

type AddItemInputProps = {
	categoryId: string
	variant?: 'foot' | 'ghost'
}

export function AddItemInput({ categoryId, variant = 'ghost' }: AddItemInputProps) {
	const t = useTranslations('list')
	const { addItem } = useListActions()
	const [name, setName] = useState('')

	const onSubmit = (event: FormEvent) => {
		event.preventDefault()
		const trimmed = name.trim()
		if (trimmed.length === 0) return
		addItem(categoryId, trimmed)
		setName('')
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') setName('')
	}

	return (
		<form onSubmit={onSubmit}>
			<label
				className={cx(
					'group flex cursor-text items-center gap-2.5 px-4 transition-colors focus-within:bg-primary-soft/40 sm:px-5',
					variant === 'foot' ? 'h-11' : 'h-10 border-t border-line/70',
				)}
			>
				<TbPlus
					aria-hidden="true"
					className={cx(
						'size-4 shrink-0 transition-colors',
						name.length > 0 ? 'text-primary' : 'text-ink-faint group-focus-within:text-primary',
					)}
				/>
				<input
					value={name}
					onChange={event => setName(event.target.value)}
					onKeyDown={onKeyDown}
					placeholder={t('addItemPlaceholder')}
					aria-label={t('addItemPlaceholder')}
					className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
				/>
			</label>
		</form>
	)
}
