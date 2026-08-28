import type { ReactNode } from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/brand/Logo'

export default async function AuthLayout({ children }: { children: ReactNode }) {
	const t = await getTranslations('auth')

	return (
		<div className="flex min-h-screen">
			<div className="flex w-full flex-col items-center justify-center gap-10 px-6 py-12 lg:w-1/2">
				<Logo />
				{children}
			</div>
			<div className="relative hidden w-1/2 flex-col justify-end overflow-hidden p-12 lg:flex">
				<Image src="/auth-hero.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
				<div className="absolute inset-0 bg-gradient-to-t from-primary-strong/80 via-primary/60 to-primary/35" />
				<Logo variant="mark" className="absolute top-12 left-12 size-8 text-on-primary/80" />
				<div className="relative space-y-2">
					<span className="font-display text-4xl leading-tight font-bold tracking-tight text-on-primary lowercase">
						packbar
					</span>
					<p className="max-w-sm text-sm text-on-primary/80">{t('heroClaim')}</p>
				</div>
			</div>
		</div>
	)
}
