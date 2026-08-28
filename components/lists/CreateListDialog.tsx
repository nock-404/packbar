'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { TbCheck, TbPlus, TbSparkles } from 'react-icons/tb'
import { createList } from '@/app/actions/lists'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cx } from '@/lib/cx'
import { defaultTemplate } from '@/lib/default-template'
import { basisSelection, templatePresets, unionCategories } from '@/lib/presets'
import { nightsBetween } from '@/lib/suggestions'
import type { CreateSource, ListSummary } from '@/lib/dal/lists'

type SourceKind = CreateSource['kind']

const categoryOptions = defaultTemplate.map(category => ({
	name: category.name,
	count: category.items.length + (category.children ?? []).reduce((sum, child) => sum + child.items.length, 0),
}))

type CategoryCardProps = {
	name: string
	count: number
	selected: boolean
	onToggle: () => void
}

function CategoryCard({ name, count, selected, onToggle }: CategoryCardProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={selected}
			className={cx(
				'flex items-center justify-between gap-2 rounded-md border p-2.5 text-left transition-colors',
				selected ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong',
			)}
		>
			<span className="flex min-w-0 items-center gap-2.5">
				<span
					className={cx(
						'flex size-5 shrink-0 items-center justify-center rounded-[0.3125rem] border-2',
						selected ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface-raised',
					)}
				>
					{selected && <TbCheck className="size-3.5" />}
				</span>
				<span className="truncate text-sm font-medium text-ink">{name}</span>
			</span>
			<span className="shrink-0 font-mono text-xs text-ink-muted tabular-nums">{count}</span>
		</button>
	)
}

type CreateListDialogProps = {
	lists: ListSummary[]
	templates: ListSummary[]
	trigger?: 'card' | 'button'
}

export function CreateListDialog({ lists, templates, trigger = 'card' }: CreateListDialogProps) {
	const t = useTranslations('dashboard.createDialog')
	const tCommon = useTranslations('common')
	const router = useRouter()

	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [tripDate, setTripDate] = useState('')
	const [tripEnd, setTripEnd] = useState('')
	const [source, setSource] = useState<SourceKind>('empty')
	const [templateId, setTemplateId] = useState(templates[0]?.id ?? '')
	const [duplicateId, setDuplicateId] = useState(lists[0]?.id ?? '')
	const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => new Set(basisSelection))
	const [activePresetIds, setActivePresetIds] = useState<Set<string>>(() => new Set())
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<'missingSelection' | 'generic' | null>(null)

	const reset = () => {
		setName('')
		setTripDate('')
		setTripEnd('')
		setSource('empty')
		setTemplateId(templates[0]?.id ?? '')
		setDuplicateId(lists[0]?.id ?? '')
		setSelectedCategories(new Set(basisSelection))
		setActivePresetIds(new Set())
		setError(null)
	}

	const togglePreset = (presetId: string) => {
		setActivePresetIds(previous => {
			let next: Set<string>
			if (presetId === 'alles') {
				next = previous.has('alles') ? new Set() : new Set(['alles'])
			} else {
				next = new Set(previous)
				next.delete('alles')
				if (next.has(presetId)) next.delete(presetId)
				else next.add(presetId)
			}
			setSelectedCategories(next.size === 0 ? new Set(basisSelection) : new Set(unionCategories(next)))
			return next
		})
	}

	const toggleCategory = (name: string) => {
		setSelectedCategories(previous => {
			const next = new Set(previous)
			if (next.has(name)) next.delete(name)
			else next.add(name)
			return next
		})
	}

	const onOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) reset()
	}

	const sourceOptions: { kind: SourceKind; title: string; description: string }[] = [
		{ kind: 'empty', title: t('sourceEmptyTitle'), description: t('sourceEmptyDescription') },
		{ kind: 'default', title: t('sourceDefaultTitle'), description: t('sourceDefaultDescription') },
		...(templates.length > 0
			? [{ kind: 'template' as const, title: t('sourceTemplateTitle'), description: t('sourceTemplateDescription') }]
			: []),
		...(lists.length > 0
			? [{ kind: 'duplicate' as const, title: t('sourceDuplicateTitle'), description: t('sourceDuplicateDescription') }]
			: []),
	]

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)

		let createSource: CreateSource
		if (source === 'empty') {
			createSource = { kind: 'empty' }
		} else if (source === 'default') {
			if (selectedCategories.size === 0) {
				setError('missingSelection')
				return
			}
			createSource = { kind: 'default', categories: Array.from(selectedCategories) }
		} else if (source === 'template') {
			if (!templateId) {
				setError('missingSelection')
				return
			}
			createSource = { kind: 'template', templateId }
		} else {
			if (!duplicateId) {
				setError('missingSelection')
				return
			}
			createSource = { kind: 'duplicate', listId: duplicateId }
		}

		setLoading(true)
		try {
			const created = await createList(name, createSource, {
				tripDate: tripDate.length > 0 ? tripDate : null,
				tripEnd: tripEnd.length > 0 ? tripEnd : null,
			})
			router.push(`/lists/${created.id}`)
		} catch {
			setLoading(false)
			setError('generic')
		}
	}

	const nights = tripDate.length > 0 && tripEnd.length > 0 ? nightsBetween(tripDate, tripEnd) : 0

	return (
		<>
			{trigger === 'card' ? (
				<button
					type="button"
					onClick={() => onOpenChange(true)}
					className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong text-ink-muted transition-colors hover:border-primary hover:text-primary"
				>
					<TbPlus className="size-6" />
					<span className="text-sm font-medium">{t('trigger')}</span>
				</button>
			) : (
				<Button onClick={() => onOpenChange(true)}>
					<TbPlus />
					{t('trigger')}
				</Button>
			)}
			<Dialog
				open={open}
				onClose={() => onOpenChange(false)}
				title={t('title')}
				footer={
					<>
						<Button variant="secondary" onClick={() => onOpenChange(false)}>
							{tCommon('cancel')}
						</Button>
						<Button
							type="submit"
							form="create-list-form"
							loading={loading}
							disabled={source === 'default' && selectedCategories.size === 0}
						>
							{t('submit')}
						</Button>
					</>
				}
			>
				<form id="create-list-form" onSubmit={onSubmit} className="space-y-5">
					<div className="space-y-1.5">
						<label htmlFor="create-list-name" className="text-sm font-medium text-ink">
							{t('nameLabel')}
						</label>
						<Input
							id="create-list-name"
							value={name}
							onChange={event => setName(event.target.value)}
							required
							autoFocus
						/>
					</div>
					<div className="space-y-1.5">
						<span className="text-sm font-medium text-ink">
							{t('rangeLabel')}{' '}
							<span className="font-normal text-ink-faint">{t('rangeOptional')}</span>
						</span>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<label htmlFor="create-list-trip-date" className="text-xs text-ink-muted">
									{t('rangeFrom')}
								</label>
								<Input
									id="create-list-trip-date"
									type="date"
									value={tripDate}
									onChange={event => setTripDate(event.target.value)}
								/>
							</div>
							<div className="space-y-1">
								<label htmlFor="create-list-trip-end" className="text-xs text-ink-muted">
									{t('rangeTo')}
								</label>
								<Input
									id="create-list-trip-end"
									type="date"
									min={tripDate.length > 0 ? tripDate : undefined}
									value={tripEnd}
									onChange={event => setTripEnd(event.target.value)}
								/>
							</div>
						</div>
					</div>
					<div className="space-y-1.5">
						<span className="text-sm font-medium text-ink">{t('sourceLabel')}</span>
						<div role="radiogroup" aria-label={t('sourceLabel')} className="grid gap-2 sm:grid-cols-2">
							{sourceOptions.map(option => (
								<button
									key={option.kind}
									type="button"
									role="radio"
									aria-checked={source === option.kind}
									onClick={() => setSource(option.kind)}
									className={cx(
										'space-y-0.5 rounded-md border p-3 text-left transition-colors',
										source === option.kind
											? 'border-primary bg-primary-soft'
											: 'border-line hover:border-line-strong',
									)}
								>
									<p className="text-sm font-medium text-ink">{option.title}</p>
									<p className="text-xs text-ink-muted">{option.description}</p>
								</button>
							))}
						</div>
					</div>
					{source === 'default' && (
						<div className="space-y-3">
							{nights > 0 && (
								<p className="flex items-center gap-1.5 rounded-md bg-primary-soft px-3 py-2 text-xs text-primary">
									<TbSparkles className="size-4 shrink-0" />
									{t('suggestHint', { count: nights })}
								</p>
							)}
							<div className="space-y-1.5">
								<span className="text-sm font-medium text-ink">{t('presetsLabel')}</span>
								<div className="flex flex-wrap gap-2">
									{templatePresets.map(preset => (
										<button
											key={preset.id}
											type="button"
											onClick={() => togglePreset(preset.id)}
											aria-pressed={activePresetIds.has(preset.id)}
											className={cx(
												'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
												activePresetIds.has(preset.id)
													? 'border-primary bg-primary-soft text-primary'
													: 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
											)}
										>
											{t(`presets.${preset.id}`)}
										</button>
									))}
								</div>
							</div>
							<div className="space-y-1.5">
								<span className="text-sm font-medium text-ink">{t('categoriesLabel')}</span>
								<div className="grid gap-2 sm:grid-cols-2">
									{categoryOptions.map(category => (
										<CategoryCard
											key={category.name}
											name={category.name}
											count={category.count}
											selected={selectedCategories.has(category.name)}
											onToggle={() => toggleCategory(category.name)}
										/>
									))}
								</div>
							</div>
						</div>
					)}
					{source === 'template' && (
						<div className="space-y-1.5">
							<label htmlFor="create-list-template" className="text-sm font-medium text-ink">
								{t('templateSelectLabel')}
							</label>
							<Select
								id="create-list-template"
								value={templateId}
								onChange={event => setTemplateId(event.target.value)}
								options={templates.map(template => ({ value: template.id, label: template.name }))}
							/>
						</div>
					)}
					{source === 'duplicate' && (
						<div className="space-y-1.5">
							<label htmlFor="create-list-duplicate" className="text-sm font-medium text-ink">
								{t('duplicateSelectLabel')}
							</label>
							<Select
								id="create-list-duplicate"
								value={duplicateId}
								onChange={event => setDuplicateId(event.target.value)}
								options={lists.map(list => ({ value: list.id, label: list.name }))}
							/>
						</div>
					)}
					{error && (
						<p className="text-sm text-danger">
							{error === 'missingSelection' ? t('errorMissingSelection') : t('errorGeneric')}
						</p>
					)}
				</form>
			</Dialog>
		</>
	)
}
