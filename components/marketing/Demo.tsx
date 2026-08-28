import { getTranslations } from 'next-intl/server'
import { TbArrowRight } from 'react-icons/tb'
import { ExampleListCard } from './ExampleListCard'

export async function Demo() {
	const t = await getTranslations('landing.demo')

	return (
		<section className="px-6 pb-16 sm:px-10 sm:pb-24">
			<div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div className="max-w-md space-y-4">
					<p className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">{t('eyebrow')}</p>
					<h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('title')}</h2>
					<p className="text-base text-ink-muted">{t('text')}</p>
					<p className="inline-flex items-center gap-1.5 font-mono text-xs text-primary">
						<TbArrowRight className="size-3.5 shrink-0" />
						{t('hint')}
					</p>
				</div>
				<ExampleListCard className="w-full max-w-sm justify-self-center lg:justify-self-end" />
			</div>
		</section>
	)
}
