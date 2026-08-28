'use client'

import type { ReactNode } from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

type ScrollAreaProps = {
	className?: string
	children: ReactNode
}

export function ScrollArea({ className, children }: ScrollAreaProps) {
	return (
		<OverlayScrollbarsComponent
			defer
			options={{ scrollbars: { autoHide: 'scroll', theme: 'os-theme-packbar' } }}
			className={className}
		>
			{children}
		</OverlayScrollbarsComponent>
	)
}
