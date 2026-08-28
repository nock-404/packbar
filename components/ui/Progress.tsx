import { cx } from '@/lib/cx'

const sizes = {
	sm: 'h-1.5',
	md: 'h-2.5',
}

type ProgressProps = {
	value: number
	max: number
	size?: 'sm' | 'md'
	className?: string
}

export function Progress({ value, max, size = 'md', className }: ProgressProps) {
	const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
	const done = max > 0 && value >= max

	return (
		<div
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
			className={cx('w-full overflow-hidden rounded-full bg-surface-sunken', sizes[size], className)}
		>
			<div
				style={{ width: `${pct}%` }}
				className={cx(
					'h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
					done ? 'bg-success' : 'bg-primary',
				)}
			/>
		</div>
	)
}
