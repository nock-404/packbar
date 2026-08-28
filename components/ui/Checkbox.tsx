'use client'

import { cx } from '@/lib/cx'

const boxSizes = {
	md: 'size-5 rounded-[0.3125rem]',
	lg: 'size-6 rounded-[0.375rem]',
	responsive: 'size-6 rounded-[0.375rem] md:size-5 md:rounded-[0.3125rem]',
}

const checkSizes = {
	md: 'size-3.5',
	lg: 'size-4',
	responsive: 'size-4 md:size-3.5',
}

type CheckboxProps = {
	checked: boolean
	onCheckedChange: (value: boolean) => void
	size?: 'md' | 'lg' | 'responsive'
	disabled?: boolean
	className?: string
}

export function Checkbox({ checked, onCheckedChange, size = 'md', disabled = false, className }: CheckboxProps) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cx(
				'group -m-2 inline-flex shrink-0 items-center justify-center p-2 outline-none disabled:pointer-events-none disabled:opacity-55',
				className,
			)}
		>
			<span
				className={cx(
					'flex items-center justify-center border-2 transition-colors duration-150 group-focus-visible:ring-2 group-focus-visible:ring-primary/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-surface',
					boxSizes[size],
					checked
						? 'border-primary bg-primary'
						: 'border-line-strong bg-surface-raised group-hover:border-primary',
				)}
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
					className={cx(
						'text-on-primary',
						checkSizes[size],
						checked ? 'animate-stamp opacity-100 motion-reduce:animate-none' : 'opacity-0',
					)}
				>
					<path
						d="M5 12.5 10 17.5 19 7"
						stroke="currentColor"
						strokeWidth="3.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						pathLength={1}
						className={cx('[stroke-dasharray:1]', checked && 'animate-check-draw motion-reduce:animate-none')}
					/>
				</svg>
			</span>
		</button>
	)
}
