import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

const tones = {
	default: 'rounded-full border-line bg-surface-sunken px-2.5 text-xs font-medium text-ink-muted',
	accent: 'rounded-full border-accent/30 bg-accent-soft px-2.5 text-xs font-medium text-accent-ink',
	success: 'rounded-full border-success/30 bg-success-soft px-2.5 text-xs font-medium text-success-ink',
	priority:
		'-rotate-1 rounded-xs border-accent-strong/50 bg-accent px-2 font-mono text-[0.625rem] font-bold tracking-[0.15em] text-on-accent uppercase',
}

type BadgeProps = {
	children: ReactNode
	tone?: keyof typeof tones
	className?: string
}

export function Badge({ children, tone = 'default', className }: BadgeProps) {
	return (
		<span
			className={cx(
				'inline-flex items-center gap-1 border py-0.5 [&>svg]:size-3.5',
				tones[tone],
				className,
			)}
		>
			{children}
		</span>
	)
}
