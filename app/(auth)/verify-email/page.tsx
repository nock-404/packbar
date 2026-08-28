'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

function VerifyEmailContent() {
	const t = useTranslations('auth.verifyEmail')
	const searchParams = useSearchParams()
	const email = searchParams.get('email')

	const [resending, setResending] = useState(false)
	const [resent, setResent] = useState(false)
	const [error, setError] = useState(false)

	const onResend = async () => {
		if (!email) return
		setResending(true)
		setError(false)
		const { error: resendError } = await authClient.sendVerificationEmail({ email, callbackURL: '/dashboard' })
		setResending(false)
		if (resendError) {
			setError(true)
			return
		}
		setResent(true)
	}

	return (
		<div className="space-y-4">
			<p className="text-sm text-ink">{email ? t('description', { email }) : t('descriptionFallback')}</p>
			{email && (
				<Button type="button" variant="secondary" loading={resending} onClick={onResend} className="w-full">
					{t('resend')}
				</Button>
			)}
			{resent && <p className="text-sm text-success-ink">{t('resendSent')}</p>}
			{error && <p className="text-sm text-danger">{t('resendError')}</p>}
			<Link href="/login" className="block text-center text-sm font-medium text-primary transition-colors hover:text-primary-strong">
				{t('backToLogin')}
			</Link>
		</div>
	)
}

export default function VerifyEmailPage() {
	const t = useTranslations('auth.verifyEmail')

	return (
		<AuthCard title={t('title')}>
			<Suspense
				fallback={
					<div className="flex justify-center py-6">
						<Spinner />
					</div>
				}
			>
				<VerifyEmailContent />
			</Suspense>
		</AuthCard>
	)
}
