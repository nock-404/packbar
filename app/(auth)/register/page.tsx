'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { AuthCard } from '@/components/auth/AuthCard'
import { PasswordChecklist } from '@/components/auth/PasswordChecklist'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { validatePassword } from '@/lib/password'

type RegisterError = 'passwordMismatch' | 'userExists' | 'generic'

export default function RegisterPage() {
	const t = useTranslations('auth.register')
	const tPolicy = useTranslations('auth.passwordPolicy')
	const router = useRouter()

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [passwordConfirm, setPasswordConfirm] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<RegisterError | null>(null)

	const { ok: passwordOk, checks } = validatePassword(password)
	const passwordsMatch = password.length > 0 && password === passwordConfirm
	const canSubmit = passwordOk && passwordsMatch

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError(null)

		if (!passwordOk) {
			return
		}
		if (!passwordsMatch) {
			setError('passwordMismatch')
			return
		}

		setLoading(true)
		const { error: signUpError } = await authClient.signUp.email({
			name,
			email,
			password,
			callbackURL: '/dashboard',
		})
		setLoading(false)

		if (!signUpError) {
			router.push(`/verify-email?email=${encodeURIComponent(email)}`)
			return
		}

		if (signUpError.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
			setError('userExists')
		} else {
			setError('generic')
		}
	}

	return (
		<AuthCard title={t('title')} description={t('description')}>
			<form onSubmit={onSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="register-name" className="text-sm font-medium text-ink">
						{t('nameLabel')}
					</label>
					<Input
						id="register-name"
						type="text"
						required
						autoComplete="name"
						value={name}
						onChange={event => setName(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="register-email" className="text-sm font-medium text-ink">
						{t('emailLabel')}
					</label>
					<Input
						id="register-email"
						type="email"
						required
						autoComplete="email"
						value={email}
						onChange={event => setEmail(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="register-password" className="text-sm font-medium text-ink">
						{t('passwordLabel')}
					</label>
					<Input
						id="register-password"
						type="password"
						required
						autoComplete="new-password"
						value={password}
						onChange={event => setPassword(event.target.value)}
					/>
					<PasswordChecklist checks={checks} />
				</div>
				<div className="space-y-1.5">
					<label htmlFor="register-password-confirm" className="text-sm font-medium text-ink">
						{tPolicy('repeat')}
					</label>
					<Input
						id="register-password-confirm"
						type="password"
						required
						autoComplete="new-password"
						value={passwordConfirm}
						onChange={event => setPasswordConfirm(event.target.value)}
					/>
				</div>
				{error && (
					<p className="text-sm text-danger">
						{error === 'passwordMismatch' && tPolicy('mismatch')}
						{error === 'userExists' && t('errorUserExists')}
						{error === 'generic' && t('errorGeneric')}
					</p>
				)}
				<Button type="submit" loading={loading} disabled={!canSubmit} className="w-full">
					{t('submit')}
				</Button>
				<div className="text-center text-sm">
					<Link href="/login" className="font-medium text-primary transition-colors hover:text-primary-strong">
						{t('loginLink')}
					</Link>
				</div>
			</form>
		</AuthCard>
	)
}
