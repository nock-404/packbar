import type { ReactNode } from 'react'

type AuthCardProps = {
	title: string
	description?: string
	children: ReactNode
	footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
	return (
		<div className="w-full max-w-sm space-y-6">
			<div className="space-y-1.5 text-center">
				<h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h1>
				{description && <p className="text-sm text-ink-muted">{description}</p>}
			</div>
			<div className="space-y-5 rounded-xl border border-line bg-surface-raised p-6 shadow-sm shadow-black/10">
				{children}
			</div>
			{footer && <div className="text-center text-sm text-ink-muted">{footer}</div>}
		</div>
	)
}
