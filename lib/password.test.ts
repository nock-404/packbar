import { describe, expect, test } from 'vitest'
import { validatePassword } from './password'

describe('validatePassword', () => {
	test('lehnt zu kurzes Passwort ab', () => {
		const result = validatePassword('Ab1')
		expect(result.ok).toBe(false)
		expect(result.checks.minLength).toBe(false)
	})

	test('erkennt fehlenden Kleinbuchstaben', () => {
		const result = validatePassword('PASSWORT123')
		expect(result.checks.hasLower).toBe(false)
		expect(result.ok).toBe(false)
	})

	test('erkennt fehlenden Grossbuchstaben', () => {
		const result = validatePassword('passwort123')
		expect(result.checks.hasUpper).toBe(false)
		expect(result.ok).toBe(false)
	})

	test('erkennt fehlende Zahl', () => {
		const result = validatePassword('Passwortabc')
		expect(result.checks.hasNumber).toBe(false)
		expect(result.ok).toBe(false)
	})

	test('akzeptiert ein Passwort das alle Regeln erfuellt', () => {
		const result = validatePassword('Packbar2026')
		expect(result).toEqual({
			ok: true,
			checks: { minLength: true, hasLower: true, hasUpper: true, hasNumber: true },
		})
	})

	test('genau 10 Zeichen reicht (min. 10)', () => {
		expect(validatePassword('Abcdefghi1').checks.minLength).toBe(true)
		expect(validatePassword('Abcdefgh1').checks.minLength).toBe(false)
	})
})
