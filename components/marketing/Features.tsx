import { getTranslations } from 'next-intl/server'
import { TbBeach, TbChecklist, TbPrinter, TbShare2 } from 'react-icons/tb'
import type { IconType } from 'react-icons'

const features: { key: string; icon: IconType }[] = [
	{ key: 'template', icon: TbChecklist },
	{ key: 'share', icon: TbShare2 },
	{ key: 'presets', icon: TbBeach },
	{ key: 'print', icon: TbPrinter },
]

export async function Features() {
	const t = await getTranslations('landing.features')

	return (
		<section className="px-6 py-14 sm:px-10 sm:py-20">
			<div className="mx-auto max-w-5xl space-y-10">
				<div className="max-w-md space-y-4">
					<p className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">{t('eyebrow')}</p>
					<h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('title')}</h2>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{features.map(feature => (
						<div
							key={feature.key}
							className="flex h-full flex-col rounded-lg border border-line bg-surface-raised shadow-sm shadow-ink/5"
						>
							<div className="space-y-3 p-5">
								<span className="inline-flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary [&>svg]:size-5">
									<feature.icon />
								</span>
								<h3 className="font-display text-lg leading-tight font-semibold text-ink">
									{t(`${feature.key}.title`)}
								</h3>
								<p className="text-sm text-ink-muted">{t(`${feature.key}.text`)}</p>
							</div>
							<div className="mt-auto">
								<div className="perforation" />
								<p className="px-5 py-3.5 font-mono text-[0.625rem] tracking-[0.15em] text-ink-faint uppercase tabular-nums">
									{t(`${feature.key}.meta`)}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
