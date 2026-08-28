'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { TbX } from 'react-icons/tb'
import { IconButton } from './IconButton'
import { ScrollArea } from './ScrollArea'

type DialogProps = {
	open: boolean
	onClose: () => void
	title: string
	children: ReactNode
	footer?: ReactNode
}

const focusableSelector =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
	const t = useTranslations('common')
	const panelRef = useRef<HTMLDivElement>(null)
	const onCloseRef = useRef(onClose)

	useEffect(() => {
		onCloseRef.current = onClose
	}, [onClose])

	useEffect(() => {
		if (!open) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onCloseRef.current()
				return
			}
			if (event.key !== 'Tab') return
			const panel = panelRef.current
			if (!panel) return
			const focusables = panel.querySelectorAll<HTMLElement>(focusableSelector)
			if (focusables.length === 0) return
			const first = focusables[0]
			const last = focusables[focusables.length - 1]
			const active = document.activeElement
			if (event.shiftKey && (active === first || active === panel)) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && active === last) {
				event.preventDefault()
				first.focus()
			}
		}
		document.addEventListener('keydown', onKeyDown)
		panelRef.current?.focus()
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open])

	if (!open || typeof document === 'undefined') return null

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
			<div
				aria-hidden="true"
				onClick={onClose}
				className="absolute inset-0 animate-fade-in bg-ink/35 backdrop-blur-sm motion-reduce:animate-none dark:bg-black/55"
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				tabIndex={-1}
				className="relative w-full max-w-md animate-pop-in rounded-xl border border-line bg-surface-raised shadow-xl shadow-ink/10 outline-none motion-reduce:animate-none dark:shadow-black/40"
			>
				<div className="flex items-center justify-between gap-4 py-4 pr-3 pl-6">
					<h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
					<IconButton label={t('close')} onClick={onClose}>
						<TbX />
					</IconButton>
				</div>
				<ScrollArea className="max-h-[60vh]">
					<div className="px-6 pb-5">{children}</div>
				</ScrollArea>
				{footer && (
					<>
						<div className="perforation" />
						<div className="flex justify-end gap-2 px-6 py-4">{footer}</div>
					</>
				)}
			</div>
		</div>,
		document.body,
	)
}
