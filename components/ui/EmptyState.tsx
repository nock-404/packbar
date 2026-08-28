import type { ReactNode } from 'react'

type EmptyStateProps = {
	icon: ReactNode
	title: string
	description?: string
	action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-1.5 px-6 py-16 text-center">
			<div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary [&>svg]:size-7">
				{icon}
			</div>
			<h3 className="font-display text-base font-semibold text-ink">{title}</h3>
			{description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
			{action && <div className="mt-4">{action}</div>}
		</div>
	)
}
