import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/brand/Logo'

export async function AppFooter() {
	const t = await getTranslations('layout.footer')

	return (
		<footer className="mx-auto w-full max-w-6xl px-6 pt-10 pb-8 print:hidden">
			<div className="perforation mb-5" />
			<div className="flex flex-wrap items-center justify-between gap-3">
				<span className="inline-flex items-center gap-2 text-ink-faint">
					<Logo variant="mark" className="size-4" />
					<span className="font-mono text-xs tracking-[0.2em] uppercase">{t('claim')}</span>
				</span>
				<span className="font-mono text-xs text-ink-faint tabular-nums">
					{t('copyright', { year: new Date().getFullYear() })}
				</span>
			</div>
		</footer>
	)
}
