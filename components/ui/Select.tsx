import type { ComponentPropsWithRef } from 'react'
import { TbChevronDown } from 'react-icons/tb'
import { cx } from '@/lib/cx'

type SelectProps = ComponentPropsWithRef<'select'> & {
	options: { value: string; label: string }[]
}

export function Select({ options, className, ...props }: SelectProps) {
	return (
		<span className={cx('relative inline-flex w-full', className)}>
			<select
				className="h-10 w-full appearance-none rounded-md border border-line bg-surface-raised pr-9 pl-3.5 text-sm text-ink transition-colors outline-none not-disabled:hover:border-line-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-faint"
				{...props}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<TbChevronDown
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
			/>
		</span>
	)
}
