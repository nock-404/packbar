import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/brand/Logo'
import { ThemeSwitch } from '@/components/theme/ThemeSwitch'
import { Badge } from '@/components/ui/Badge'
import { ListView } from '@/components/lists/ListView'
import { AppFooter } from '@/components/layout/AppFooter'
import { getSharedList } from '@/lib/dal/share'

const loadSharedList = cache(getSharedList)

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
	const { token } = await params
	const t = await getTranslations('share')
	const shared = await loadSharedList(token)

	if (!shared) {
		return { title: t('genericTitle') }
	}

	return {
		title: shared.list.name,
		openGraph: { title: shared.list.name },
	}
}

export default async function SharedListPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params
	const shared = await loadSharedList(token)
	if (!shared) notFound()

	const t = await getTranslations('share')

	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-b border-line bg-surface-raised">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
					<Logo />
					<div className="flex items-center gap-3">
						<Badge tone={shared.mode === 'edit' ? 'accent' : 'default'}>
							{shared.mode === 'edit' ? t('badge.edit') : t('badge.read')}
						</Badge>
						<ThemeSwitch />
					</div>
				</div>
			</header>
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
				<ListView initial={shared.list} editable={shared.mode === 'edit'} tokenMode={token} />
			</main>
			<AppFooter />
		</div>
	)
}
