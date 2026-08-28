import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/brand/Logo'

export async function Hero({ authenticated }: { authenticated: boolean }) {
	const t = await getTranslations('landing.hero')

	return (
		<section className="relative flex flex-col sm:min-h-[48vh]">
			<Image src="/auth-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
			<div className="absolute inset-0 bg-gradient-to-tr from-primary-strong/90 via-primary/40 to-primary/5 dark:from-primary-soft/90 dark:via-primary-soft/50 dark:to-primary-soft/10" />
			<header className="relative flex items-center justify-between px-6 py-4 sm:px-10 sm:py-5">
				<span className="inline-flex items-center gap-2 rounded-md bg-primary/75 px-3 py-1.5 text-on-primary">
					<Logo variant="mark" className="size-5" />
					<span className="font-display text-lg font-bold tracking-tight lowercase">packbar</span>
				</span>
				<Link
					href="/login"
					className="inline-flex h-9 items-center rounded-md bg-primary/75 px-4 text-sm font-medium text-on-primary transition-colors outline-none hover:bg-primary focus-visible:ring-2 focus-visible:ring-on-primary/70 dark:focus-visible:ring-ink/70"
				>
					{t('login')}
				</Link>
			</header>
			<div className="relative mt-auto w-full px-6 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
				<div className="mx-auto max-w-5xl">
					<h1 className="max-w-2xl animate-fade-in font-display text-3xl leading-tight font-bold tracking-tight text-on-primary motion-reduce:animate-none sm:text-5xl dark:text-ink">
						{t('claim')}
					</h1>
					<p className="mt-3 max-w-xl animate-fade-in text-sm text-on-primary/85 [animation-delay:80ms] motion-reduce:animate-none sm:text-base dark:text-ink/85">
						{t('subline')}
					</p>
					<div className="mt-6 flex animate-fade-in flex-wrap gap-3 [animation-delay:160ms] motion-reduce:animate-none">
						<Link
							href={authenticated ? '/dashboard' : '/register'}
							className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-semibold text-on-accent transition-colors outline-none hover:bg-accent-strong focus-visible:ring-2 focus-visible:ring-on-primary/70 dark:focus-visible:ring-ink/70"
						>
							{authenticated ? t('toDashboard') : t('ctaRegister')}
						</Link>
						{!authenticated && (
						<Link
							href="/login"
							className="inline-flex h-11 items-center rounded-md border border-on-primary/40 px-5 text-sm font-medium text-on-primary transition-colors outline-none hover:bg-on-primary/10 focus-visible:ring-2 focus-visible:ring-on-primary/70 dark:border-ink/40 dark:text-ink dark:hover:bg-ink/10 dark:focus-visible:ring-ink/70"
						>
							{t('ctaLogin')}
						</Link>
						)}
					</div>
				</div>
			</div>
			<div className="relative">
				<div className="border-t-2 border-dashed border-on-primary/35 dark:border-ink/35" />
				<span className="absolute top-0 -left-2.5 size-5 -translate-y-1/2 rounded-full bg-surface" />
				<span className="absolute top-0 -right-2.5 size-5 -translate-y-1/2 rounded-full bg-surface" />
			</div>
		</section>
	)
}
