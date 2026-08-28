export interface PasswordChecks {
	minLength: boolean
	hasLower: boolean
	hasUpper: boolean
	hasNumber: boolean
}

export interface PasswordValidation {
	ok: boolean
	checks: PasswordChecks
}

export function validatePassword(password: string): PasswordValidation {
	const checks: PasswordChecks = {
		minLength: password.length >= 10,
		hasLower: /[a-z]/.test(password),
		hasUpper: /[A-Z]/.test(password),
		hasNumber: /[0-9]/.test(password),
	}

	return {
		ok: checks.minLength && checks.hasLower && checks.hasUpper && checks.hasNumber,
		checks,
	}
}
