import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { TbLuggage } from 'react-icons/tb'
import { auth } from '@/lib/auth'
import { daysUntil } from '@/lib/dates'
import { getListSummaries, getTemplates } from '@/lib/dal/lists'
import { CreateListDialog } from '@/components/lists/CreateListDialog'
import { ListCard } from '@/components/lists/ListCard'
import { TripHero } from '@/components/lists/TripHero'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function DashboardPage() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) redirect('/login')

	const t = await getTranslations('dashboard')
	const [lists, templates] = await Promise.all([
		getListSummaries(session.user.id),
		getTemplates(session.user.id),
	])

	const upcoming = lists
		.filter(list => list.tripDate !== null && daysUntil(list.tripDate) >= 0)
		.sort((a, b) => daysUntil(a.tripDate!) - daysUntil(b.tripDate!))
	const hero = upcoming[0] ?? lists[0] ?? null
	const rest = hero ? lists.filter(list => list.id !== hero.id) : []

	return (
		<div className="space-y-12">
			<section className="space-y-5">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div className="space-y-1">
						<h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{t('title')}</h1>
						<p className="font-mono text-xs text-ink-muted tabular-nums">{t('listCount', { count: lists.length })}</p>
					</div>
					{hero && <CreateListDialog lists={lists} templates={templates} trigger="button" />}
				</div>
				{hero ? (
					<>
						<TripHero list={hero} />
						{rest.length > 0 && (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{rest.map(list => (
									<ListCard key={list.id} list={list} />
								))}
							</div>
						)}
					</>
				) : (
					<div className="rounded-lg border border-line bg-surface-raised">
						<EmptyState
							icon={<TbLuggage />}
							title={t('empty.title')}
							description={t('empty.description')}
							action={<CreateListDialog lists={lists} templates={templates} trigger="button" />}
						/>
					</div>
				)}
			</section>
			{templates.length > 0 && (
				<section className="space-y-4">
					<h2 className="font-display text-lg font-semibold text-ink">{t('templatesTitle')}</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{templates.map(template => (
							<ListCard key={template.id} list={template} compact isTemplate />
						))}
					</div>
				</section>
			)}
		</div>
	)
}
