import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/brand/Logo'
import { cx } from '@/lib/cx'
import type { CategoryWithItems, ListWithContent } from '@/lib/dal/tree'
import type { Item, Person } from '@/lib/db/schema'

function formatDate(dateString: string): string {
	const [year, month, day] = dateString.split('-')
	return `${day}.${month}.${year}`
}

function personInitials(name: string): string {
	const parts = name.trim().split(/\s+/)
	const first = parts[0]?.[0] ?? ''
	const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
	return `${first}${second}`.toUpperCase()
}

function ItemLine({ item, persons }: { item: Item; persons: Person[] }) {
	const person = item.personId ? persons.find(p => p.id === item.personId) : undefined

	return (
		<li className="flex items-start gap-1.5 py-0.5 text-[0.8rem] leading-snug">
			<span
				className={cx(
					'mt-0.5 flex size-3 shrink-0 items-center justify-center border border-black text-[0.55rem] leading-none',
					item.packed && 'bg-black text-white',
				)}
			>
				{item.packed ? '✓' : ''}
			</span>
			<span>
				{item.lastMinute && <strong>{'! '}</strong>}
				{item.quantity != null && `${item.quantity}x `}
				{item.name}
				{person && ` (${personInitials(person.name)})`}
				{item.note && <span className="block text-[0.65rem] text-gray-600">{item.note}</span>}
			</span>
		</li>
	)
}

function CategoryBlock({ category, persons }: { category: CategoryWithItems; persons: Person[] }) {
	if (category.items.length === 0) return null

	return (
		<div className="mb-3 break-inside-avoid">
			<h3 className="mb-1 text-sm font-bold text-black">{category.name}</h3>
			<ul>
				{category.items.map(item => (
					<ItemLine key={item.id} item={item} persons={persons} />
				))}
			</ul>
		</div>
	)
}

type PrintViewProps = {
	list: ListWithContent
}

export async function PrintView({ list }: PrintViewProps) {
	const t = await getTranslations('list.print')

	return (
		<div className="mx-auto max-w-3xl p-8 text-black print:p-0">
			<div className="mb-6 flex items-start justify-between">
				<Logo />
				<div className="text-right text-sm">
					{list.destination && <p>{list.destination}</p>}
					{list.tripDate && <p>{formatDate(list.tripDate)}</p>}
				</div>
			</div>
			<h1 className="mb-6 text-2xl font-bold">{list.name}</h1>
			<div className="columns-1 gap-8 print:columns-2">
				{list.categories.map(category => (
					<div key={category.id} className="break-inside-avoid">
						<CategoryBlock category={category} persons={list.persons} />
						{category.children.map(child => (
							<div key={child.id} className="mb-3 ml-4">
								<CategoryBlock category={child} persons={list.persons} />
							</div>
						))}
					</div>
				))}
			</div>
			<p className="mt-8 text-center text-xs text-gray-500">{t('footer')}</p>
		</div>
	)
}
