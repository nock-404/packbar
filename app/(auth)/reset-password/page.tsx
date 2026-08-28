'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordChecklist } from '@/components/auth/PasswordChecklist'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { validatePassword } from '@/lib/password'

type ResetError = 'mismatch' | 'generic'

function ResetPasswordForm() {
	const t = useTranslations('auth.resetPassword')
	const tPolicy = useTranslations('auth.passwordPolicy')
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	const [password, setPassword] = useState('')
	const [passwordConfirm, setPasswordConfirm] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<ResetError | null>(null)
	const [success, setSuccess] = useState(false)

	const { ok: passwordOk, checks } = validatePassword(password)
	const passwordsMatch = password.length > 0 && password === passwordConfirm
	const canSubmit = passwordOk && passwordsMatch

	if (!token) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-danger">{t('errorMissingToken')}</p>
				<Link href="/forgot-password" className="block text-center text-sm font-medium text-primary transition-colors hover:text-primary-strong">
					{t('requestNewLink')}
				</Link>
			</div>
		)
	}

	if (success) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-success-ink">{t('success')}</p>
				<Link href="/login" className="block text-center text-sm font-medium text-primary transition-colors hover:text-primary-strong">
					{t('loginLink')}
				</Link>
			</div>
		)
	}

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)

		if (!passwordOk) return
		if (!passwordsMatch) {
			setError('mismatch')
			return
		}

		setLoading(true)
		const { error: resetError } = await authClient.resetPassword({ newPassword: password, token })
		setLoading(false)

		if (resetError) {
			setError('generic')
			return
		}
		setSuccess(true)
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-1.5">
				<label htmlFor="reset-password" className="text-sm font-medium text-ink">
					{t('passwordLabel')}
				</label>
				<Input
					id="reset-password"
					type="password"
					required
					autoComplete="new-password"
					value={password}
					onChange={event => setPassword(event.target.value)}
				/>
				<PasswordChecklist checks={checks} />
			</div>
			<div className="space-y-1.5">
				<label htmlFor="reset-password-confirm" className="text-sm font-medium text-ink">
					{t('passwordConfirmLabel')}
				</label>
				<Input
					id="reset-password-confirm"
					type="password"
					required
					autoComplete="new-password"
					value={passwordConfirm}
					onChange={event => setPasswordConfirm(event.target.value)}
				/>
			</div>
			{error && (
				<p className="text-sm text-danger">
					{error === 'mismatch' && tPolicy('mismatch')}
					{error === 'generic' && t('errorGeneric')}
				</p>
			)}
			<Button type="submit" loading={loading} disabled={!canSubmit} className="w-full">
				{t('submit')}
			</Button>
		</form>
	)
}

export default function ResetPasswordPage() {
	const t = useTranslations('auth.resetPassword')

	return (
		<AuthCard title={t('title')} description={t('description')}>
			<Suspense
				fallback={
					<div className="flex justify-center py-6">
						<Spinner />
					</div>
				}
			>
				<ResetPasswordForm />
			</Suspense>
		</AuthCard>
	)
}
