import { cx } from '@/lib/cx'

type DestinationCodeProps = {
	code: string
	className?: string
}

export function DestinationCode({ code, className }: DestinationCodeProps) {
	return (
		<span
			className={cx(
				'inline-flex items-center rounded-xs border border-line-strong px-1.5 py-0.5 font-mono text-xs font-bold tracking-[0.2em] text-ink-muted uppercase',
				className,
			)}
		>
			{code}
		</span>
	)
}
