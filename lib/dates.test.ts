import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { daysUntil } from './dates'

describe('daysUntil', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	test('gibt die Anzahl Tage bis zu einem zukünftigen Datum zurück', () => {
		vi.setSystemTime(new Date('2026-07-23T09:00:00'))
		expect(daysUntil('2026-08-22')).toBe(30)
	})

	test('gibt 0 zurück, wenn das Datum heute ist', () => {
		vi.setSystemTime(new Date('2026-07-23T23:45:00'))
		expect(daysUntil('2026-07-23')).toBe(0)
	})

	test('gibt eine negative Zahl für vergangene Daten zurück', () => {
		vi.setSystemTime(new Date('2026-07-23T09:00:00'))
		expect(daysUntil('2026-07-01')).toBe(-22)
	})

	test('ist unabhängig von der Uhrzeit am selben Tag', () => {
		vi.setSystemTime(new Date('2026-07-23T00:01:00'))
		expect(daysUntil('2026-07-24')).toBe(1)
	})

	test('rechnet über einen Monatswechsel hinweg korrekt', () => {
		vi.setSystemTime(new Date('2026-01-30T12:00:00'))
		expect(daysUntil('2026-02-01')).toBe(2)
	})
})
