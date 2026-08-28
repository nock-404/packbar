import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/lib/cx'

type IconButtonProps = ComponentPropsWithRef<'button'> & {
	label: string
}

export function IconButton({ label, type, className, children, ...props }: IconButtonProps) {
	return (
		<button
			type={type ?? 'button'}
			aria-label={label}
			title={label}
			className={cx(
				'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors outline-none hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-55 [&>svg]:size-5',
				className,
			)}
			{...props}
		>
			{children}
		</button>
	)
}
