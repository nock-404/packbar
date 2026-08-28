import { describe, expect, test } from 'vitest'
import { codeToCondition } from './weather'

describe('codeToCondition', () => {
	test('ordnet Code 0 (klarer Himmel) sun zu', () => {
		expect(codeToCondition(0)).toBe('sun')
	})

	test('ordnet leicht bis stark bewölkte Codes cloud zu', () => {
		expect(codeToCondition(1)).toBe('cloud')
		expect(codeToCondition(2)).toBe('cloud')
		expect(codeToCondition(3)).toBe('cloud')
	})

	test('ordnet Nebel-Codes cloud zu', () => {
		expect(codeToCondition(45)).toBe('cloud')
		expect(codeToCondition(48)).toBe('cloud')
	})

	test('ordnet Nieselregen-Codes rain zu', () => {
		expect(codeToCondition(51)).toBe('rain')
		expect(codeToCondition(53)).toBe('rain')
		expect(codeToCondition(55)).toBe('rain')
	})

	test('ordnet gefrierenden Nieselregen rain zu', () => {
		expect(codeToCondition(56)).toBe('rain')
		expect(codeToCondition(57)).toBe('rain')
	})

	test('ordnet Regen-Codes rain zu', () => {
		expect(codeToCondition(61)).toBe('rain')
		expect(codeToCondition(63)).toBe('rain')
		expect(codeToCondition(65)).toBe('rain')
	})

	test('ordnet gefrierenden Regen rain zu', () => {
		expect(codeToCondition(66)).toBe('rain')
		expect(codeToCondition(67)).toBe('rain')
	})

	test('ordnet Regenschauer rain zu', () => {
		expect(codeToCondition(80)).toBe('rain')
		expect(codeToCondition(81)).toBe('rain')
		expect(codeToCondition(82)).toBe('rain')
	})

	test('ordnet Schneefall-Codes snow zu', () => {
		expect(codeToCondition(71)).toBe('snow')
		expect(codeToCondition(73)).toBe('snow')
		expect(codeToCondition(75)).toBe('snow')
		expect(codeToCondition(77)).toBe('snow')
	})

	test('ordnet Schneeschauer snow zu', () => {
		expect(codeToCondition(85)).toBe('snow')
		expect(codeToCondition(86)).toBe('snow')
	})

	test('ordnet Gewitter-Codes storm zu', () => {
		expect(codeToCondition(95)).toBe('storm')
		expect(codeToCondition(96)).toBe('storm')
		expect(codeToCondition(99)).toBe('storm')
	})

	test('fällt bei unbekanntem Code auf cloud zurück', () => {
		expect(codeToCondition(-1)).toBe('cloud')
		expect(codeToCondition(120)).toBe('cloud')
	})
})
