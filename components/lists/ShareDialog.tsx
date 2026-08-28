'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { TbCheck, TbCopy } from 'react-icons/tb'
import { rotateShareToken, setShareMode } from '@/app/actions/share'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Dialog } from '@/components/ui/Dialog'
import { cx } from '@/lib/cx'
import type { ShareMode } from '@/lib/db/schema'

type ShareDialogProps = {
	listId: string
	shareMode: ShareMode
	shareToken: string | null
	onClose: () => void
	onModeChange: (mode: ShareMode, shareToken: string | null) => void
}

const modes: ShareMode[] = ['off', 'read', 'edit']

export function ShareDialog({ listId, shareMode, shareToken, onClose, onModeChange }: ShareDialogProps) {
	const t = useTranslations('share')
	const tCommon = useTranslations('common')

	const [copied, setCopied] = useState(false)
	const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false)
	const [loading, setLoading] = useState(false)

	const onSelectMode = async (mode: ShareMode) => {
		if (mode === shareMode || loading) return
		setLoading(true)
		const result = await setShareMode(listId, mode)
		setLoading(false)
		onModeChange(mode, result.shareToken)
	}

	const onRotate = async () => {
		setLoading(true)
		const result = await rotateShareToken(listId)
		setLoading(false)
		onModeChange(shareMode, result.shareToken)
		setRotateConfirmOpen(false)
	}

	const onCopy = async (url: string) => {
		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const shareUrl = shareToken && typeof window !== 'undefined' ? `${window.location.origin}/share/${shareToken}` : null

	return (
		<>
			<Dialog
				open
				onClose={onClose}
				title={t('title')}
				footer={
					<Button variant="secondary" onClick={onClose}>
						{tCommon('close')}
					</Button>
				}
			>
				<div className="space-y-4">
					<div role="radiogroup" aria-label={t('modeLabel')} className="space-y-2">
						{modes.map(mode => (
							<button
								key={mode}
								type="button"
								role="radio"
								aria-checked={shareMode === mode}
								disabled={loading}
								onClick={() => onSelectMode(mode)}
								className={cx(
									'block w-full space-y-0.5 rounded-md border p-3 text-left transition-colors disabled:pointer-events-none disabled:opacity-70',
									shareMode === mode ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong',
								)}
							>
								<p className="text-sm font-medium text-ink">{t(`modes.${mode}.title`)}</p>
								<p className="text-xs text-ink-muted">{t(`modes.${mode}.description`)}</p>
							</button>
						))}
					</div>
					{shareMode !== 'off' && shareUrl && (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<input
									readOnly
									value={shareUrl}
									className="h-10 flex-1 rounded-md border border-line bg-surface-sunken px-3 text-sm text-ink-muted"
								/>
								<Button type="button" variant="secondary" onClick={() => onCopy(shareUrl)}>
									{copied ? <TbCheck className="size-4" /> : <TbCopy className="size-4" />}
									{copied ? t('copied') : t('copy')}
								</Button>
							</div>
							<Button type="button" variant="ghost" size="sm" onClick={() => setRotateConfirmOpen(true)}>
								{t('rotate')}
							</Button>
						</div>
					)}
				</div>
			</Dialog>
			<ConfirmDialog
				open={rotateConfirmOpen}
				onClose={() => setRotateConfirmOpen(false)}
				onConfirm={onRotate}
				title={t('rotateConfirm.title')}
				message={t('rotateConfirm.message')}
				confirmLabel={t('rotate')}
				destructive
			/>
		</>
	)
}
