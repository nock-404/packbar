'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
	const t = useTranslations('auth.forgotPassword')

	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setLoading(true)
		await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
		setLoading(false)
		setSubmitted(true)
	}

	return (
		<AuthCard title={t('title')} description={t('description')}>
			{submitted ? (
				<div className="space-y-4">
					<p className="text-sm text-ink">{t('successText')}</p>
					<Link href="/login" className="block text-center text-sm font-medium text-primary transition-colors hover:text-primary-strong">
						{t('backToLogin')}
					</Link>
				</div>
			) : (
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<label htmlFor="forgot-email" className="text-sm font-medium text-ink">
							{t('emailLabel')}
						</label>
						<Input
							id="forgot-email"
							type="email"
							required
							autoComplete="email"
							value={email}
							onChange={event => setEmail(event.target.value)}
						/>
					</div>
					<Button type="submit" loading={loading} className="w-full">
						{t('submit')}
					</Button>
					<div className="text-center text-sm">
						<Link href="/login" className="text-ink-muted transition-colors hover:text-ink">
							{t('backToLogin')}
						</Link>
					</div>
				</form>
			)}
		</AuthCard>
	)
}
