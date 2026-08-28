'use client'

import Link from 'next/link'
import { useFormatter, useTranslations } from 'next-intl'
import { TbCalendar, TbMapPin, TbMapPinPlus } from 'react-icons/tb'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { daysUntil } from '@/lib/dates'
import { CoverImage } from './CoverImage'
import { ListCardMenu } from './ListCardMenu'
import { destinationCode, formatTripRange } from './tripDates'
import type { ListSummary } from '@/lib/dal/lists'

type ListCardProps = {
	list: ListSummary
	compact?: boolean
	isTemplate?: boolean
}

export function ListCard({ list, compact = false, isTemplate = false }: ListCardProps) {
	const t = useTranslations('dashboard')
	const format = useFormatter()
	const days = list.tripDate ? daysUntil(list.tripDate) : null
	const { packed, total } = list.progress
	const hasTrip = list.destination !== null || list.tripDate !== null

	if (compact) {
		return (
			<div className="group relative flex items-center gap-3 rounded-lg border border-line bg-surface-raised p-4 shadow-sm shadow-black/10 transition-shadow hover:shadow-md hover:shadow-black/20">
				<Link href={`/lists/${list.id}`} className="absolute inset-0 z-10" aria-label={list.name} />
				<div className="min-w-0 flex-1 space-y-0.5">
					<h3 className="truncate font-display text-base leading-tight font-semibold text-ink">{list.name}</h3>
					<p className="font-mono text-xs text-ink-muted tabular-nums">
						{t('templateItems', { count: total })}
					</p>
				</div>
				<div className="relative z-20 shrink-0">
					<ListCardMenu list={list} isTemplate={isTemplate} tone="plain" />
				</div>
			</div>
		)
	}

	return (
		<div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-raised shadow-sm shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
			<Link href={`/lists/${list.id}`} className="absolute inset-0 z-10" aria-label={list.name} />
			<div className="relative h-28">
				<CoverImage
					coverImage={list.coverImage}
					seed={list.id}
					sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 50vw, 100vw"
					overlayClassName="bg-gradient-to-t from-black/55 via-black/10 to-black/5"
				/>
				{list.destination && (
					<p className="absolute right-4 bottom-2.5 font-mono text-sm font-bold tracking-[0.3em] text-white/85">
						{destinationCode(list.destination)}
					</p>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-2.5 p-5 pb-4">
				<h3 className="font-display text-xl leading-tight font-bold tracking-tight text-ink">{list.name}</h3>
				{hasTrip ? (
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
						{list.destination && (
							<span className="inline-flex items-center gap-1">
								<TbMapPin className="size-3.5" />
								{list.destination}
							</span>
						)}
						{list.tripDate && (
							<span className="inline-flex items-center gap-1 font-mono tabular-nums">
								<TbCalendar className="size-3.5" />
								{formatTripRange(format, list.tripDate, list.tripEnd)}
							</span>
						)}
						{days !== null && days >= 0 && (
							<Badge tone="accent">{days === 0 ? t('today') : t('daysUntil', { count: days })}</Badge>
						)}
					</div>
				) : (
					<span className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-line-strong px-2.5 py-1 text-xs text-ink-faint">
						<TbMapPinPlus className="size-3.5" />
						{t('setTripHint')}
					</span>
				)}
			</div>
			<div className="relative">
				<div className="perforation" />
				<span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
				<span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
			</div>
			{total === 0 ? (
				<p className="p-5 pt-3.5 text-xs text-ink-faint">{t('emptyListHint')}</p>
			) : packed === 0 ? (
				<p className="p-5 pt-3.5 text-xs text-ink-muted">{t('nothingPackedHint', { count: total })}</p>
			) : (
				<div className="flex items-center gap-4 p-5 pt-4">
					<Progress value={packed} max={total} size="sm" className="flex-1" />
					<p className="shrink-0 font-mono text-xs whitespace-nowrap text-ink-muted tabular-nums">
						{packed} / {total}
					</p>
				</div>
			)}
			<div className="absolute top-3 right-3 z-20">
				<ListCardMenu list={list} isTemplate={isTemplate} />
			</div>
		</div>
	)
}
