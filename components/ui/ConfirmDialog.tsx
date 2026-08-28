'use client'

import { useTranslations } from 'next-intl'
import { Button } from './Button'
import { Dialog } from './Dialog'

type ConfirmDialogProps = {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	message: string
	confirmLabel?: string
	destructive?: boolean
}

export function ConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel,
	destructive = false,
}: ConfirmDialogProps) {
	const t = useTranslations('common')

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title={title}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						{t('cancel')}
					</Button>
					<Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
						{confirmLabel ?? t('confirm')}
					</Button>
				</>
			}
		>
			<p className="text-sm text-ink-muted">{message}</p>
		</Dialog>
	)
}
