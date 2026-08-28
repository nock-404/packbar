import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import { cx } from '@/lib/cx'

type DropIndicatorProps = {
	edge: Edge | null
}

export function DropIndicator({ edge }: DropIndicatorProps) {
	if (edge !== 'top' && edge !== 'bottom') return null

	return (
		<div
			aria-hidden="true"
			className={cx(
				'pointer-events-none absolute inset-x-2 z-10 h-0.5 rounded-full bg-primary',
				edge === 'top' ? 'top-0' : 'bottom-0',
			)}
		/>
	)
}
