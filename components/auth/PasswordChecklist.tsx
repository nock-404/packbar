import { useTranslations } from 'next-intl'
import { TbCheck } from 'react-icons/tb'
import { cx } from '@/lib/cx'
import type { PasswordChecks } from '@/lib/password'

type PasswordChecklistProps = {
	checks: PasswordChecks
}

const items: { key: keyof PasswordChecks; labelKey: string }[] = [
	{ key: 'minLength', labelKey: 'minLength' },
	{ key: 'hasLower', labelKey: 'hasLower' },
	{ key: 'hasUpper', labelKey: 'hasUpper' },
	{ key: 'hasNumber', labelKey: 'hasNumber' },
]

export function PasswordChecklist({ checks }: PasswordChecklistProps) {
	const t = useTranslations('auth.passwordPolicy')

	return (
		<ul className="grid gap-x-4 gap-y-1.5 pt-1 sm:grid-cols-2">
			{items.map(item => {
				const met = checks[item.key]
				return (
					<li
						key={item.key}
						className={cx(
							'flex items-center gap-2 font-mono text-xs transition-colors',
							met ? 'text-success-ink' : 'text-ink-faint',
						)}
					>
						<span
							className={cx(
								'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
								met ? 'border-success bg-success text-on-primary' : 'border-line-strong',
							)}
						>
							{met && <TbCheck className="size-3 animate-stamp motion-reduce:animate-none" />}
						</span>
						{t(item.labelKey)}
					</li>
				)
			})}
		</ul>
	)
}
