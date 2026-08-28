import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { covers } from '@/lib/covers'

const coverIds = ['adria', 'berge', 'stadt', 'roadtrip', 'camping', 'winter']

export async function CoverStrip() {
	const t = await getTranslations('landing.covers')
	const selection = coverIds.flatMap(id => {
		const cover = covers.find(entry => entry.id === id)
		return cover ? [cover] : []
	})

	return (
		<section className="px-6 pb-16 sm:px-10 sm:pb-24">
			<div className="mx-auto max-w-5xl space-y-10">
				<div className="max-w-md space-y-4">
					<p className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">{t('eyebrow')}</p>
					<h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('title')}</h2>
				</div>
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
					{selection.map(cover => (
						<div key={cover.id} className="relative aspect-[3/4] overflow-hidden rounded-md border border-line">
							<Image
								src={`/covers/${cover.file}`}
								alt=""
								fill
								sizes="(min-width: 640px) 15vw, 30vw"
								className="object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
							<span className="absolute bottom-2 left-2.5 font-mono text-[0.625rem] font-bold tracking-[0.2em] text-white uppercase">
								{cover.id.slice(0, 3)}
							</span>
						</div>
					))}
				</div>
				<div className="flex flex-col items-center gap-5 pt-2 text-center">
					<h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('outro')}</h2>
					<Link
						href="/register"
						className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-base font-semibold text-on-primary transition-colors outline-none hover:bg-primary-strong focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
					>
						{t('cta')}
					</Link>
				</div>
			</div>
		</section>
	)
}
