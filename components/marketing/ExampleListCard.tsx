'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cx } from '@/lib/cx'
import { Logo } from '@/components/brand/Logo'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { DestinationCode } from '@/components/ui/DestinationCode'
import { Progress } from '@/components/ui/Progress'

type DemoItem = {
	key: string
	initial: boolean
	lastMinute?: boolean
}

const demoItems: DemoItem[] = [
	{ key: 'sunscreen', initial: true },
	{ key: 'swimsuit', initial: true },
	{ key: 'towel', initial: false },
	{ key: 'snorkel', initial: false },
	{ key: 'powerbank', initial: false, lastMinute: true },
]

const otherPacked = 16
const total = 31

export function ExampleListCard({ className }: { className?: string }) {
	const t = useTranslations('landing.demo.card')
	const [checked, setChecked] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(demoItems.map(item => [item.key, item.initial])),
	)
	const packed = otherPacked + demoItems.filter(item => checked[item.key]).length

	return (
		<div
			className={cx(
				'relative overflow-hidden rounded-lg border border-line bg-surface-raised shadow-md shadow-ink/10',
				className,
			)}
		>
			<div className="flex h-24 items-end justify-between bg-gradient-to-br from-primary to-primary-strong p-4">
				<Logo variant="mark" className="size-6 text-on-primary/80" />
				<p className="font-mono text-[0.625rem] tracking-[0.2em] text-on-primary/80 uppercase">{t('kicker')}</p>
			</div>
			<div className="space-y-3 p-5">
				<div className="flex items-start justify-between gap-4">
					<h3 className="font-display text-2xl leading-tight font-bold tracking-tight text-ink">{t('title')}</h3>
					<DestinationCode code={t('code')} className="mt-1 shrink-0" />
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<p className="font-mono text-xs text-ink-muted tabular-nums">{t('dates')}</p>
					<Badge tone="accent">{t('daysBadge')}</Badge>
				</div>
			</div>
			<div className="relative">
				<div className="perforation" />
				<span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
				<span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
			</div>
			<div className="space-y-3.5 p-5">
				<p className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase tabular-nums">{t('section')}</p>
				<ul className="space-y-2.5">
					{demoItems.map(item => (
						<li key={item.key} className="flex items-center gap-2.5">
							<Checkbox
								checked={checked[item.key]}
								onCheckedChange={value => setChecked(current => ({ ...current, [item.key]: value }))}
							/>
							<span
								className={cx(
									'text-sm transition-colors',
									checked[item.key]
										? 'text-ink-faint line-through decoration-primary/50 decoration-2'
										: 'text-ink',
								)}
							>
								{t(`items.${item.key}`)}
							</span>
							{item.lastMinute && (
								<Badge tone="priority" className="ml-auto shrink-0">
									{t('lastMinute')}
								</Badge>
							)}
						</li>
					))}
				</ul>
			</div>
			<div className="perforation" />
			<div className="flex items-center gap-4 p-5 pt-4">
				<Progress value={packed} max={total} size="sm" className="flex-1" />
				<p className="font-mono text-xs text-ink-muted tabular-nums">
					{packed} / {total}
				</p>
			</div>
		</div>
	)
}
