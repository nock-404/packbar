import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/brand/Logo'

export async function LandingFooter() {
	const t = await getTranslations('landing.footer')

	return (
		<footer className="px-6 sm:px-10">
			<div className="mx-auto max-w-5xl">
				<div className="perforation" />
				<div className="flex flex-col items-start gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
					<Logo />
					<div className="flex items-center gap-5 text-sm">
						<Link href="/login" className="text-ink-muted transition-colors hover:text-ink">
							{t('login')}
						</Link>
						<Link
							href="/register"
							className="font-medium text-primary transition-colors hover:text-primary-strong"
						>
							{t('register')}
						</Link>
					</div>
					<p className="font-mono text-xs text-ink-faint tabular-nums">
						{t('copyright', { year: new Date().getFullYear() })}
					</p>
				</div>
			</div>
		</footer>
	)
}
