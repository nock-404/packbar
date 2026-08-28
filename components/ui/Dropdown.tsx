'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/cx'
import { ScrollArea } from './ScrollArea'

type DropdownItem = {
	icon?: ReactNode
	label: string
	onSelect: () => void
	destructive?: boolean
	disabled?: boolean
	title?: string
}

type DropdownProps = {
	trigger: ReactNode
	items: DropdownItem[]
	align?: 'start' | 'end'
	header?: ReactNode
}

type MenuPosition = {
	top: number
	left?: number
	right?: number
}

export function Dropdown({ trigger, items, align = 'end', header }: DropdownProps) {
	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState<MenuPosition | null>(null)
	const triggerRef = useRef<HTMLSpanElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	const toggle = () => {
		if (open) {
			setOpen(false)
			return
		}
		const rect = triggerRef.current?.getBoundingClientRect()
		if (!rect) return
		setPosition(
			align === 'end'
				? { top: rect.bottom + 6, right: window.innerWidth - rect.right }
				: { top: rect.bottom + 6, left: rect.left },
		)
		setOpen(true)
	}

	useEffect(() => {
		if (!open) return
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Node
			if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
			setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false)
				return
			}
			if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
			const menu = menuRef.current
			if (!menu) return
			event.preventDefault()
			const menuItems = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'))
			if (menuItems.length === 0) return
			const index = menuItems.indexOf(document.activeElement as HTMLElement)
			const next =
				event.key === 'ArrowDown'
					? menuItems[(index + 1) % menuItems.length]
					: menuItems[(index - 1 + menuItems.length) % menuItems.length]
			next.focus()
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<>
			<span ref={triggerRef} onClick={toggle} className="inline-flex">
				{trigger}
			</span>
			{open &&
				position &&
				createPortal(
					<div
						ref={menuRef}
						role="menu"
						style={position}
						className="fixed z-50 min-w-44 animate-slide-in rounded-md border border-line bg-surface-raised p-1 shadow-lg shadow-ink/10 motion-reduce:animate-none dark:shadow-black/40"
					>
						{header && (
							<div className="mb-1 border-b border-line px-3 py-2 text-sm text-ink-muted">{header}</div>
						)}
						<ScrollArea className="max-h-72">
							{items.map((item) => (
								<button
									key={item.label}
									type="button"
									role="menuitem"
									aria-disabled={item.disabled || undefined}
									title={item.title}
									onClick={() => {
										if (item.disabled) return
										setOpen(false)
										item.onSelect()
									}}
									className={cx(
										'flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm transition-colors outline-none [&>svg]:size-4 [&>svg]:shrink-0',
										item.disabled
											? 'cursor-not-allowed text-ink-faint opacity-55'
											: item.destructive
												? 'text-danger hover:bg-danger-soft focus:bg-danger-soft'
												: 'text-ink hover:bg-surface-sunken focus:bg-surface-sunken',
									)}
								>
									{item.icon}
									{item.label}
								</button>
							))}
						</ScrollArea>
					</div>,
					document.body,
				)}
		</>
	)
}
