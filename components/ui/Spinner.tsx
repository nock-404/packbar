import { cx } from '@/lib/cx'

const sizes = {
	sm: 'size-4',
	md: 'size-5',
}

type SpinnerProps = {
	size?: 'sm' | 'md'
	className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			className={cx('animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]', sizes[size], className)}
		>
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-40" />
			<path d="M21 12A9 9 0 0 0 3 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
		</svg>
	)
}
