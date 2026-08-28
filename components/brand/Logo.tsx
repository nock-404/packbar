import { cx } from '@/lib/cx'

type LogoProps = {
	variant?: 'full' | 'mark'
	className?: string
}

function Mark({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M9 7.5V6c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v1.5"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<rect x="3" y="7.5" width="18" height="12.5" rx="3.5" stroke="currentColor" strokeWidth="2" />
			<path
				d="m8.6 13.6 2.5 2.6 4.5-5.2"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export function Logo({ variant = 'full', className }: LogoProps) {
	if (variant === 'mark') {
		return <Mark className={cx('size-6', className)} />
	}

	return (
		<span className={cx('inline-flex items-center gap-2', className)}>
			<Mark className="size-6 text-primary" />
			<span className="font-display text-xl font-bold tracking-tight lowercase">packbar</span>
		</span>
	)
}
