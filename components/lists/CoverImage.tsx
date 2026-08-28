import Image from 'next/image'
import { cx } from '@/lib/cx'
import { coverUrl, gradientClass, isCustomCoverId, resolveCoverId } from '@/lib/covers'

type CoverImageProps = {
	coverImage: string | null
	seed: string
	sizes: string
	priority?: boolean
	overlayClassName?: string
}

export function CoverImage({ coverImage, seed, sizes, priority = false, overlayClassName }: CoverImageProps) {
	const cover = resolveCoverId(coverImage, seed)
	const url = cover.startsWith('gradient:') ? null : coverUrl(cover)

	return (
		<>
			{url ? (
				<Image
					src={url}
					alt=""
					fill
					sizes={sizes}
					priority={priority}
					unoptimized={isCustomCoverId(cover)}
					className="object-cover"
				/>
			) : (
				<div
					className={cx(
						'absolute inset-0 bg-gradient-to-br',
						gradientClass[cover] ?? gradientClass['gradient:teal'],
					)}
				/>
			)}
			{overlayClassName && <div className={cx('absolute inset-0', overlayClassName)} />}
		</>
	)
}
