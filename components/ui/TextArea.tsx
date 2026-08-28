import type { ComponentPropsWithRef } from 'react'
import { cx } from '@/lib/cx'

type TextAreaProps = ComponentPropsWithRef<'textarea'>

export function TextArea({ className, ...props }: TextAreaProps) {
	return (
		<textarea
			className={cx(
				'min-h-24 w-full resize-none field-sizing-content rounded-md border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-ink transition-colors outline-none placeholder:text-ink-faint not-disabled:hover:border-line-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-faint',
				className,
			)}
			{...props}
		/>
	)
}
