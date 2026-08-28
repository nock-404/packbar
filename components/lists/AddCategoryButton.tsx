'use client'

import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { TbFolderPlus } from 'react-icons/tb'
import { Input } from '@/components/ui/Input'
import { useListActions } from './ListActionsContext'

type AddCategoryButtonProps = {
	parentId: string | null
	label: string
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function AddCategoryButton({ parentId, label, open: controlledOpen, onOpenChange }: AddCategoryButtonProps) {
	const t = useTranslations('list')
	const { addCategory } = useListActions()
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
	const [name, setName] = useState('')
	const committingRef = useRef(false)
	const open = controlledOpen ?? uncontrolledOpen

	const setOpen = (value: boolean) => {
		if (controlledOpen === undefined) setUncontrolledOpen(value)
		onOpenChange?.(value)
	}

	const openInput = () => {
		committingRef.current = false
		setOpen(true)
	}

	const commit = () => {
		if (committingRef.current) return
		committingRef.current = true
		const trimmed = name.trim()
		if (trimmed.length > 0) addCategory(trimmed, parentId)
		setName('')
		setOpen(false)
	}

	const cancel = () => {
		committingRef.current = true
		setName('')
		setOpen(false)
	}

	const onSubmit = (event: FormEvent) => {
		event.preventDefault()
		commit()
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') cancel()
	}

	if (!open) {
		return (
			<button
				type="button"
				onClick={openInput}
				className="inline-flex items-center gap-2 rounded-md border-2 border-dashed border-line-strong px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-primary hover:text-primary"
			>
				<TbFolderPlus className="size-4" />
				{label}
			</button>
		)
	}

	return (
		<form onSubmit={onSubmit} className="max-w-xs">
			<Input
				autoFocus
				value={name}
				onChange={event => setName(event.target.value)}
				onBlur={commit}
				onKeyDown={onKeyDown}
				placeholder={t('categoryNamePlaceholder')}
				aria-label={t('categoryNamePlaceholder')}
			/>
		</form>
	)
}
