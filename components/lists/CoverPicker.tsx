'use client'

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { TbCheck, TbTrash, TbUpload } from 'react-icons/tb'
import { cx } from '@/lib/cx'
import { covers, gradientCovers, coverUrl, gradientClass } from '@/lib/covers'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Spinner } from '@/components/ui/Spinner'

type TileProps = {
	selected: boolean
	onClick: () => void
	label: string
	children: ReactNode
	action?: ReactNode
}

function Tile({ selected, onClick, label, children, action }: TileProps) {
	return (
		<div
			className={cx(
				'group relative aspect-video overflow-hidden rounded-md border-2 transition-colors',
				selected ? 'border-primary' : 'border-line hover:border-line-strong',
			)}
		>
			<button type="button" onClick={onClick} aria-pressed={selected} title={label} className="absolute inset-0">
				{children}
			</button>
			{selected && (
				<span className="pointer-events-none absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-on-primary">
					<TbCheck className="size-3.5" />
				</span>
			)}
			{action}
		</div>
	)
}

type CoverPickerProps = {
	value: string | null
	onChange: (value: string | null) => void
}

export function CoverPicker({ value, onChange }: CoverPickerProps) {
	const t = useTranslations('uploads')
	const [ownIds, setOwnIds] = useState<string[]>([])
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		let cancelled = false
		fetch('/api/uploads')
			.then(response => (response.ok ? response.json() : []))
			.then((ids: string[]) => {
				if (!cancelled) setOwnIds(ids)
			})
			.catch(() => undefined)
		return () => {
			cancelled = true
		}
	}, [])

	const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		event.target.value = ''
		if (!file) return

		setError(null)
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			setError(t('errors.invalidType'))
			return
		}
		if (file.size > 5 * 1024 * 1024) {
			setError(t('errors.tooLarge'))
			return
		}

		setUploading(true)
		try {
			const formData = new FormData()
			formData.append('file', file)
			const response = await fetch('/api/uploads', { method: 'POST', body: formData })
			if (!response.ok) throw new Error('upload_failed')
			const { id } = (await response.json()) as { id: string }
			setOwnIds(current => [id, ...current])
			onChange(`custom:${id}`)
		} catch {
			setError(t('errors.generic'))
		} finally {
			setUploading(false)
		}
	}

	const onConfirmDelete = async () => {
		const id = deleteId
		setDeleteId(null)
		if (!id) return
		try {
			const response = await fetch(`/api/uploads/${id}`, { method: 'DELETE' })
			if (!response.ok) throw new Error('delete_failed')
			setOwnIds(current => current.filter(existing => existing !== id))
			if (value === `custom:${id}`) onChange(null)
		} catch {
			setError(t('errors.generic'))
		}
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
				{gradientCovers.map(gradient => (
					<Tile key={gradient.id} selected={value === gradient.id} onClick={() => onChange(gradient.id)} label={gradient.label}>
						<div className={cx('size-full bg-gradient-to-br', gradientClass[gradient.id])} />
					</Tile>
				))}
				{covers.map(cover => (
					<Tile key={cover.id} selected={value === cover.id} onClick={() => onChange(cover.id)} label={cover.label}>
						<Image src={coverUrl(cover.id) ?? ''} alt={cover.label} fill sizes="120px" className="object-cover" />
					</Tile>
				))}
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between gap-2">
					<h4 className="font-display text-sm font-semibold text-ink">{t('title')}</h4>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
						className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium text-primary outline-none transition-colors hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-55"
					>
						{uploading ? <Spinner size="sm" /> : <TbUpload className="size-4" />}
						{t('upload')}
					</button>
					<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileSelected} />
				</div>
				{ownIds.length > 0 && (
					<div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
						{ownIds.map(id => {
							const coverId = `custom:${id}`
							return (
								<Tile
									key={id}
									selected={value === coverId}
									onClick={() => onChange(coverId)}
									label={t('title')}
									action={
										<IconButton
											label={t('deleteLabel')}
											onClick={event => {
												event.stopPropagation()
												setDeleteId(id)
											}}
											className="absolute bottom-1 left-1 size-6 bg-surface/85 text-ink-muted hover:bg-surface hover:text-danger [&>svg]:size-3.5"
										>
											<TbTrash />
										</IconButton>
									}
								>
									<Image src={coverUrl(coverId) ?? ''} alt="" fill sizes="120px" unoptimized className="object-cover" />
								</Tile>
							)
						})}
					</div>
				)}
				{error && <p className="text-sm text-danger">{error}</p>}
			</div>
			<ConfirmDialog
				open={deleteId !== null}
				onClose={() => setDeleteId(null)}
				onConfirm={onConfirmDelete}
				title={t('deleteConfirm.title')}
				message={t('deleteConfirm.message')}
				confirmLabel={t('deleteConfirm.confirm')}
				destructive
			/>
		</div>
	)
}
