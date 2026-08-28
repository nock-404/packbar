'use client'

import Link from 'next/link'
import { useFormatter, useTranslations } from 'next-intl'
import { TbArrowRight, TbCalendar, TbMapPin, TbMapPinPlus } from 'react-icons/tb'
import { Progress } from '@/components/ui/Progress'
import { daysUntil } from '@/lib/dates'
import { CoverImage } from './CoverImage'
import { destinationCode, formatTripRange } from './tripDates'
import type { ListSummary } from '@/lib/dal/lists'

type TripHeroProps = {
	list: ListSummary
}

export function TripHero({ list }: TripHeroProps) {
	const t = useTranslations('dashboard.hero')
	const tDash = useTranslations('dashboard')
	const format = useFormatter()
	const days = list.tripDate ? daysUntil(list.tripDate) : null
	const { packed, total } = list.progress
	const cta = total === 0 ? t('addItems') : packed === 0 ? t('startPacking') : t('continuePacking')

	return (
		<section className="group relative overflow-hidden rounded-lg border border-line bg-surface-raised shadow-sm shadow-black/10 transition-shadow hover:shadow-md hover:shadow-black/20">
			<Link href={`/lists/${list.id}`} className="absolute inset-0 z-10" aria-label={list.name} />
			<div className="grid md:grid-cols-[1fr_17rem]">
				<div className="relative min-h-52 sm:min-h-64">
					<CoverImage
						coverImage={list.coverImage}
						seed={list.id}
						sizes="(min-width: 48rem) 60vw, 100vw"
						priority
						overlayClassName="bg-gradient-to-t from-black/75 via-black/25 to-black/5"
					/>
					{list.destination && (
						<p className="absolute top-4 right-5 font-mono text-lg font-bold tracking-[0.3em] text-white/60 sm:text-xl">
							{destinationCode(list.destination)}
						</p>
					)}
					<div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 sm:p-6">
						<p className="font-mono text-[0.625rem] tracking-[0.25em] text-white/70 uppercase">{t('eyebrow')}</p>
						<h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-white sm:text-4xl">
							{list.name}
						</h2>
						{(list.destination || list.tripDate) && (
							<div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 font-mono text-xs text-white/85 tabular-nums sm:text-sm">
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
				<div className="relative flex flex-col gap-5 p-5 sm:p-6 md:pl-8">
					<div className="perforation absolute inset-x-5 top-0 md:hidden" />
					<span className="absolute top-0 -left-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface md:hidden" />
					<span className="absolute top-0 -right-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface md:hidden" />
					<div className="perforation-v absolute inset-y-0 left-0 hidden md:block" />
					<span className="absolute -top-2 left-0 hidden size-4 -translate-x-1/2 rounded-full border border-line bg-surface md:block" />
					<span className="absolute -bottom-2 left-0 hidden size-4 -translate-x-1/2 rounded-full border border-line bg-surface md:block" />
					{days !== null && days >= 0 ? (
						<div className="space-y-1">
							<p className="font-mono text-[0.625rem] tracking-[0.25em] text-ink-faint uppercase">
								{t('departureIn')}
							</p>
							{days === 0 ? (
								<p className="pt-1 font-mono text-4xl font-bold tracking-tight text-accent-ink uppercase">
									{t('today')}
								</p>
							) : (
								<p className="font-mono text-5xl font-bold text-ink tabular-nums">
									{days}
									<span className="ml-2 text-sm font-normal tracking-[0.2em] text-ink-muted uppercase">
										{t('days', { count: days })}
									</span>
								</p>
							)}
						</div>
					) : (
						<span className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-line-strong px-3 py-1.5 text-xs text-ink-muted">
							<TbMapPinPlus className="size-3.5" />
							{tDash('setTripHint')}
						</span>
					)}
					<div className="mt-auto space-y-4">
						{total > 0 && (
							<div className="space-y-1.5">
								<Progress value={packed} max={total} size="sm" />
								<p className="font-mono text-xs text-ink-muted tabular-nums">
									{t('packedOf', { packed, total })}
								</p>
							</div>
						)}
						<span className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors group-hover:bg-primary-strong">
							{cta}
							<TbArrowRight className="size-4" />
						</span>
					</div>
				</div>
			</div>
		</section>
	)
}
