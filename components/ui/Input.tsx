import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/lib/cx'

type InputProps = ComponentPropsWithRef<'input'> & {
	invalid?: boolean
}

export function Input({ invalid = false, className, ...props }: InputProps) {
	return (
		<input
			aria-invalid={invalid || undefined}
			className={cx(
				'h-10 w-full rounded-md border bg-surface-raised px-3.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-faint focus-visible:ring-2 disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-sunken disabled:text-ink-faint',
				invalid
					? 'border-danger focus-visible:border-danger focus-visible:ring-danger/30'
					: 'border-line not-disabled:hover:border-line-strong focus-visible:border-primary focus-visible:ring-primary/25',
				className,
			)}
			{...props}
		/>
	)
}
