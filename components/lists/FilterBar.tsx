'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { TbClockBolt, TbEyeOff, TbX } from 'react-icons/tb'
import { cx } from '@/lib/cx'
import { emptyFilters, hasActiveFilters, type Filters } from './filters'
import type { Person } from '@/lib/db/schema'

type FilterBarProps = {
	filters: Filters
	onChange: (next: Filters) => void
	persons: Person[]
	openLastMinuteCount: number
}

type ChipProps = {
	active: boolean
	onClick: () => void
	children: ReactNode
}

function Chip({ active, onClick, children }: ChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cx(
				'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors [&>svg]:size-3.5',
				active
					? 'border-primary bg-primary-soft text-primary'
					: 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
			)}
		>
			{children}
		</button>
	)
}

export function FilterBar({ filters, onChange, persons, openLastMinuteCount }: FilterBarProps) {
	const t = useTranslations('list')

	const togglePerson = (personId: string) => {
		onChange({ ...filters, personId: filters.personId === personId ? null : personId })
	}

	return (
		<div className="flex flex-wrap items-center gap-2 px-3 pb-3">
			<Chip active={filters.hideDone} onClick={() => onChange({ ...filters, hideDone: !filters.hideDone })}>
				<TbEyeOff />
				{t('filters.hideDone')}
			</Chip>
			<Chip
				active={filters.lastMinuteOnly}
				onClick={() => onChange({ ...filters, lastMinuteOnly: !filters.lastMinuteOnly })}
			>
				<TbClockBolt />
				{t('filters.lastMinuteOnly')}
				<span className="font-mono tabular-nums">({openLastMinuteCount})</span>
			</Chip>
			{persons.map(person => (
				<Chip key={person.id} active={filters.personId === person.id} onClick={() => togglePerson(person.id)}>
					{person.name}
				</Chip>
			))}
			{hasActiveFilters(filters) && (
				<button
					type="button"
					onClick={() => onChange(emptyFilters)}
					className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink [&>svg]:size-3.5"
				>
					<TbX />
					{t('filters.reset')}
				</button>
			)}
		</div>
	)
}
