import { describe, expect, test } from 'vitest'
import { nightsBetween, suggestQuantities } from './suggestions'

describe('nightsBetween', () => {
	test('berechnet die Naechte zwischen zwei Datumsangaben', () => {
		expect(nightsBetween('2026-08-01', '2026-08-05')).toBe(4)
	})

	test('gibt 0 zurueck wenn beide Daten gleich sind', () => {
		expect(nightsBetween('2026-08-01', '2026-08-01')).toBe(0)
	})

	test('rechnet ueber einen Monatswechsel hinweg korrekt', () => {
		expect(nightsBetween('2026-01-30', '2026-02-02')).toBe(3)
	})

	test('rechnet ueber einen Jahreswechsel hinweg korrekt', () => {
		expect(nightsBetween('2025-12-30', '2026-01-02')).toBe(3)
	})

	test('ist unabhaengig von der Uhrzeit, da nur das Datum uebergeben wird', () => {
		expect(nightsBetween('2026-08-01', '2026-08-31')).toBe(30)
	})
})

describe('suggestQuantities', () => {
	test('0 Naechte: Minimalwerte', () => {
		expect(suggestQuantities(0)).toEqual([
			{ itemName: 'Unterwäsche', quantity: 1 },
			{ itemName: 'Socken', quantity: 1 },
			{ itemName: 'T-Shirts', quantity: 1 },
			{ itemName: 'Kurze Hosen', quantity: 1 },
			{ itemName: 'Lange Hosen', quantity: 1 },
			{ itemName: 'Schlafanzug', quantity: 1 },
		])
	})

	test('3 Naechte: Schlafanzug noch bei 1, da nicht > 3', () => {
		const result = suggestQuantities(3)
		expect(result.find(r => r.itemName === 'Schlafanzug')?.quantity).toBe(1)
		expect(result.find(r => r.itemName === 'Unterwäsche')?.quantity).toBe(4)
		expect(result.find(r => r.itemName === 'Socken')?.quantity).toBe(4)
		expect(result.find(r => r.itemName === 'T-Shirts')?.quantity).toBe(3)
		expect(result.find(r => r.itemName === 'Kurze Hosen')?.quantity).toBe(1)
		expect(result.find(r => r.itemName === 'Lange Hosen')?.quantity).toBe(1)
	})

	test('4 Naechte: Schlafanzug springt auf 2, da > 3', () => {
		const result = suggestQuantities(4)
		expect(result.find(r => r.itemName === 'Schlafanzug')?.quantity).toBe(2)
		expect(result.find(r => r.itemName === 'Kurze Hosen')?.quantity).toBe(1)
	})

	test('7 Naechte: mittlere Reise', () => {
		const result = suggestQuantities(7)
		expect(result.find(r => r.itemName === 'Unterwäsche')?.quantity).toBe(8)
		expect(result.find(r => r.itemName === 'Socken')?.quantity).toBe(8)
		expect(result.find(r => r.itemName === 'T-Shirts')?.quantity).toBe(5)
		expect(result.find(r => r.itemName === 'Kurze Hosen')?.quantity).toBe(2)
		expect(result.find(r => r.itemName === 'Lange Hosen')?.quantity).toBe(2)
		expect(result.find(r => r.itemName === 'Schlafanzug')?.quantity).toBe(2)
	})

	test('20 Naechte: alle Obergrenzen greifen', () => {
		expect(suggestQuantities(20)).toEqual([
			{ itemName: 'Unterwäsche', quantity: 10 },
			{ itemName: 'Socken', quantity: 10 },
			{ itemName: 'T-Shirts', quantity: 8 },
			{ itemName: 'Kurze Hosen', quantity: 3 },
			{ itemName: 'Lange Hosen', quantity: 3 },
			{ itemName: 'Schlafanzug', quantity: 2 },
		])
	})

	test('enthaelt ausschliesslich die sechs definierten Items', () => {
		const result = suggestQuantities(5)
		expect(result.map(r => r.itemName)).toEqual([
			'Unterwäsche',
			'Socken',
			'T-Shirts',
			'Kurze Hosen',
			'Lange Hosen',
			'Schlafanzug',
		])
	})
})
