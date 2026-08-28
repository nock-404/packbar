'use client'

import { useEffect, useRef, useState, type ElementType, type KeyboardEvent } from 'react'
import { cx } from '@/lib/cx'

type InlineEditProps = {
	value: string
	onSave: (value: string) => void
	as?: ElementType
	className?: string
	disabled?: boolean
	editTrigger?: number
	ariaLabel?: string
	tone?: 'default' | 'onImage'
}

export function InlineEdit({ value, onSave, as: Tag = 'span', className, disabled = false, editTrigger, ariaLabel, tone = 'default' }: InlineEditProps) {
	const [editing, setEditing] = useState(false)
	const [draft, setDraft] = useState(value)
	const [seenEditTrigger, setSeenEditTrigger] = useState(editTrigger)
	const inputRef = useRef<HTMLInputElement>(null)
	const committingRef = useRef(false)

	if (editTrigger !== seenEditTrigger) {
		setSeenEditTrigger(editTrigger)
		if (editTrigger && !disabled) {
			setDraft(value)
			setEditing(true)
		}
	}

	useEffect(() => {
		if (editing) {
			committingRef.current = false
			inputRef.current?.focus()
			inputRef.current?.select()
		}
	}, [editing])

	const commit = () => {
		if (committingRef.current) return
		committingRef.current = true
		setEditing(false)
		const trimmed = draft.trim()
		if (trimmed.length > 0 && trimmed !== value) onSave(trimmed)
		else setDraft(value)
	}

	const cancel = () => {
		committingRef.current = true
		setDraft(value)
		setEditing(false)
	}

	const startEditing = () => {
		if (disabled) return
		setDraft(value)
		setEditing(true)
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			commit()
		} else if (event.key === 'Escape') {
			event.preventDefault()
			cancel()
		}
	}

	if (editing) {
		return (
			<input
				ref={inputRef}
				value={draft}
				onChange={event => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={onKeyDown}
				aria-label={ariaLabel}
				className={cx(
					'w-full rounded-sm border px-1.5 py-0.5 outline-none focus-visible:ring-2',
					tone === 'onImage'
						? 'border-white/50 bg-black/45 backdrop-blur-sm focus-visible:ring-white/30'
						: 'border-primary bg-surface-raised focus-visible:ring-primary/25',
					className,
				)}
			/>
		)
	}

	const Component = Tag as ElementType

	return (
		<Component
			onClick={startEditing}
			onKeyDown={(event: KeyboardEvent) => {
				if (event.key === 'Enter') startEditing()
			}}
			tabIndex={disabled ? undefined : 0}
			role={disabled ? undefined : 'button'}
			aria-label={disabled ? undefined : ariaLabel}
			className={cx(
				!disabled && 'cursor-text rounded-sm outline-none focus-visible:ring-2',
				!disabled &&
					(tone === 'onImage'
						? 'hover:bg-white/10 focus-visible:ring-white/40'
						: 'hover:bg-ink/5 focus-visible:ring-primary/40'),
				className,
			)}
		>
			{value}
		</Component>
	)
}
