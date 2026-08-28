'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormatter, useTranslations } from 'next-intl'
import {
	TbArrowLeft,
	TbCalendar,
	TbClipboardPlus,
	TbFilter2,
	TbMapPin,
	TbPrinter,
	TbRotateClockwise2,
	TbSettings,
	TbShare2,
} from 'react-icons/tb'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { Progress } from '@/components/ui/Progress'
import { daysUntil } from '@/lib/dates'
import { listProgress } from '@/lib/progress'
import type { ShareMode } from '@/lib/db/schema'
import { CoverImage } from './CoverImage'
import { countOpenLastMinute, hasActiveFilters, type Filters } from './filters'
import { FilterBar } from './FilterBar'
import { InlineEdit } from './InlineEdit'
import { ListSettingsDialog, type ListSettingsPatch } from './ListSettingsDialog'
import { ShareDialog } from './ShareDialog'
import { destinationCode, formatTripRange } from './tripDates'
import { WeatherHint } from './WeatherHint'
import type { ListWithContent } from '@/lib/dal/tree'

type ListHeaderProps = {
	list: ListWithContent
	editable: boolean
	tokenMode: string | null
	filters: Filters
	onFiltersChange: (next: Filters) => void
	onRenameList: (name: string) => void
	onResetPacked: () => void
	onSaveSettings: (patch: ListSettingsPatch) => void
	onShareModeChange: (mode: ShareMode, shareToken: string | null) => void
	onOpenImport?: () => void
}

export function ListHeader({
	list,
	editable,
	tokenMode,
	filters,
	onFiltersChange,
	onRenameList,
	onResetPacked,
	onSaveSettings,
	onShareModeChange,
	onOpenImport,
}: ListHeaderProps) {
	const t = useTranslations('list')
	const tDash = useTranslations('dashboard')
	const format = useFormatter()
	const [confirmResetOpen, setConfirmResetOpen] = useState(false)
	const [filterBarOpen, setFilterBarOpen] = useState(false)
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [shareOpen, setShareOpen] = useState(false)

	const isOwner = !tokenMode
	const progress = listProgress(list)
	const days = list.tripDate ? daysUntil(list.tripDate) : null

	return (
		<div className="space-y-3">
			{isOwner && (
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
				>
					<TbArrowLeft className="size-4" />
					{t('back')}
				</Link>
			)}
			<header className="overflow-hidden rounded-lg border border-line bg-surface-raised shadow-sm shadow-black/10">
				<div className="relative h-44 sm:h-56">
					<CoverImage
						coverImage={list.coverImage}
						seed={list.id}
						sizes="(min-width: 64rem) 64rem, 100vw"
						priority
						overlayClassName="bg-gradient-to-t from-black/80 via-black/30 to-black/10"
					/>
					{list.destination && (
						<p className="absolute top-4 left-5 font-mono text-base font-bold tracking-[0.3em] text-white/60 sm:top-5 sm:left-6 sm:text-lg">
							{destinationCode(list.destination)}
						</p>
					)}
					{days !== null && days >= 0 && (
						<Badge
							tone="priority"
							className="absolute top-4 right-4 px-2.5 py-1 shadow-md shadow-black/30 sm:top-5 sm:right-5"
						>
							{days === 0 ? tDash('today') : tDash('daysUntil', { count: days })}
						</Badge>
					)}
					<div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 sm:p-6">
						<InlineEdit
							as="h1"
							value={list.name}
							onSave={onRenameList}
							disabled={!editable}
							ariaLabel={t('listNameLabel')}
							tone="onImage"
							className="font-display text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl"
						/>
						{(list.destination || list.tripDate) && (
							<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-white/85 tabular-nums sm:text-sm">
								{list.destination && (
									<span className="inline-flex items-center gap-1.5">
										<TbMapPin className="size-4" />
										{list.destination}
									</span>
								)}
								{list.tripDate && (
									<span className="inline-flex items-center gap-1.5">
										<TbCalendar className="size-4" />
										{formatTripRange(format, list.tripDate, list.tripEnd)}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="space-y-2.5 px-5 py-4 sm:px-6">
					<div className="flex items-center gap-4">
						<Progress value={progress.packed} max={progress.total} className="flex-1" />
						<p className="shrink-0 font-mono text-sm whitespace-nowrap text-ink-muted tabular-nums">
							{progress.packed} / {progress.total}
						</p>
					</div>
					<WeatherHint destination={list.destination} tripDate={list.tripDate} tripEnd={list.tripEnd} />
				</div>
				<div className="relative">
					<div className="perforation" />
					<span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
					<span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
				</div>
				<div className="flex items-center justify-between gap-2 p-3 sm:px-4">
					<div className="flex items-center gap-1">
						<IconButton
							label={t('actions.filter')}
							onClick={() => setFilterBarOpen(open => !open)}
							aria-pressed={filterBarOpen}
							className={filterBarOpen || hasActiveFilters(filters) ? 'bg-primary-soft text-primary' : undefined}
						>
							<TbFilter2 />
						</IconButton>
						{isOwner && editable && onOpenImport && (
							<IconButton label={t('actions.import')} onClick={onOpenImport}>
								<TbClipboardPlus />
							</IconButton>
						)}
						<IconButton
							label={t('actions.print')}
							onClick={() => {
								const printUrl = tokenMode ? `/share/${tokenMode}/print` : `/lists/${list.id}/print`
								window.open(printUrl, '_blank')
							}}
						>
							<TbPrinter />
						</IconButton>
						{isOwner && (
							<IconButton label={t('actions.settings')} onClick={() => setSettingsOpen(true)} disabled={!editable}>
								<TbSettings />
							</IconButton>
						)}
						{isOwner && (
							<IconButton label={t('actions.resetPacked')} onClick={() => setConfirmResetOpen(true)} disabled={!editable}>
								<TbRotateClockwise2 />
							</IconButton>
						)}
					</div>
					{isOwner && (
						<Button size="sm" onClick={() => setShareOpen(true)}>
							<TbShare2 />
							{t('actions.share')}
						</Button>
					)}
				</div>
				{filterBarOpen && (
					<>
						<div className="perforation" />
						<FilterBar
							filters={filters}
							onChange={onFiltersChange}
							persons={list.persons}
							openLastMinuteCount={countOpenLastMinute(list)}
						/>
					</>
				)}
				<ConfirmDialog
					open={confirmResetOpen}
					onClose={() => setConfirmResetOpen(false)}
					onConfirm={() => {
						onResetPacked()
						setConfirmResetOpen(false)
					}}
					title={t('resetConfirm.title')}
					message={t('resetConfirm.message')}
					confirmLabel={t('resetConfirm.confirm')}
				/>
			</header>
			{settingsOpen && (
				<ListSettingsDialog list={list} onClose={() => setSettingsOpen(false)} onSave={onSaveSettings} />
			)}
			{shareOpen && (
				<ShareDialog
					listId={list.id}
					shareMode={list.shareMode}
					shareToken={list.shareToken}
					onClose={() => setShareOpen(false)}
					onModeChange={onShareModeChange}
				/>
			)}
		</div>
	)
}
