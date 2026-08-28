'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

type LoginError = 'credentials' | 'unverified' | 'generic'

function LoginForm() {
	const t = useTranslations('auth.login')
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackURL = searchParams.get('next') ?? '/dashboard'

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<LoginError | null>(null)
	const [resending, setResending] = useState(false)
	const [resent, setResent] = useState(false)
	const [resendError, setResendError] = useState(false)

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setLoading(true)
		setError(null)
		setResent(false)
		setResendError(false)

		const { error: signInError } = await authClient.signIn.email({ email, password, callbackURL })

		setLoading(false)

		if (!signInError) {
			router.push(callbackURL)
			return
		}

		if (signInError.code === 'EMAIL_NOT_VERIFIED') {
			setError('unverified')
		} else if (signInError.code === 'INVALID_EMAIL_OR_PASSWORD') {
			setError('credentials')
		} else {
			setError('generic')
		}
	}

	const onResend = async () => {
		setResending(true)
		setResendError(false)
		const { error: sendError } = await authClient.sendVerificationEmail({ email, callbackURL: '/dashboard' })
		setResending(false)
		if (sendError) {
			setResendError(true)
			return
		}
		setResent(true)
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-1.5">
				<label htmlFor="login-email" className="text-sm font-medium text-ink">
					{t('emailLabel')}
				</label>
				<Input
					id="login-email"
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={event => setEmail(event.target.value)}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="login-password" className="text-sm font-medium text-ink">
					{t('passwordLabel')}
				</label>
				<Input
					id="login-password"
					type="password"
					required
					autoComplete="current-password"
					value={password}
					onChange={event => setPassword(event.target.value)}
				/>
			</div>
			{error && (
				<div className="space-y-2">
					<p className="text-sm text-danger">
						{error === 'credentials' && t('errorInvalidCredentials')}
						{error === 'unverified' && t('errorUnverified')}
						{error === 'generic' && t('errorGeneric')}
					</p>
					{error === 'unverified' && (
						<Button type="button" variant="secondary" size="sm" loading={resending} onClick={onResend}>
							{t('resendVerification')}
						</Button>
					)}
					{resent && <p className="text-sm text-success-ink">{t('resendSent')}</p>}
					{resendError && <p className="text-sm text-danger">{t('resendError')}</p>}
				</div>
			)}
			<Button type="submit" loading={loading} className="w-full">
				{t('submit')}
			</Button>
			<div className="flex items-center justify-between text-sm">
				<Link href="/forgot-password" className="text-ink-muted transition-colors hover:text-ink">
					{t('forgotPassword')}
				</Link>
				<Link href="/register" className="font-medium text-primary transition-colors hover:text-primary-strong">
					{t('registerLink')}
				</Link>
			</div>
		</form>
	)
}

export default function LoginPage() {
	const t = useTranslations('auth.login')

	return (
		<AuthCard title={t('title')} description={t('description')}>
			<Suspense
				fallback={
					<div className="flex justify-center py-6">
						<Spinner />
					</div>
				}
			>
				<LoginForm />
			</Suspense>
		</AuthCard>
	)
}
