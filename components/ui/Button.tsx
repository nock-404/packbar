import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/lib/cx'
import { Spinner } from './Spinner'

const variants = {
	primary: 'bg-primary text-on-primary hover:bg-primary-strong focus-visible:ring-primary/40',
	secondary:
		'border border-line-strong bg-surface-raised text-ink hover:bg-surface-sunken focus-visible:ring-primary/40',
	ghost: 'text-ink-muted hover:bg-ink/5 hover:text-ink focus-visible:ring-primary/40',
	danger: 'bg-danger text-on-danger hover:bg-danger-strong focus-visible:ring-danger/40',
}

const sizes = {
	sm: 'h-8 gap-1.5 rounded-sm px-3 text-sm',
	md: 'h-10 gap-2 rounded-md px-4 text-sm',
}

type ButtonProps = ComponentPropsWithRef<'button'> & {
	variant?: keyof typeof variants
	size?: keyof typeof sizes
	loading?: boolean
}

export function Button({
	variant = 'primary',
	size = 'md',
	loading = false,
	disabled,
	type,
	className,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			type={type ?? 'button'}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			className={cx(
				'inline-flex items-center justify-center font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-55',
				variants[variant],
				sizes[size],
				className,
			)}
			{...props}
		>
			{loading && <Spinner size="sm" />}
			{children}
		</button>
	)
}
