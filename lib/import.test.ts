import { describe, expect, test } from 'vitest'
import { parseImportText } from './import'

describe('parseImportText', () => {
	test('eine Zeile ergibt einen Eintrag', () => {
		expect(parseImportText('Sonnencreme')).toEqual([{ name: 'Sonnencreme', quantity: null }])
	})

	test('mehrere Zeilen ergeben mehrere Einträge in Reihenfolge', () => {
		expect(parseImportText('Sonnencreme\nZahnbürste\nHandtuch')).toEqual([
			{ name: 'Sonnencreme', quantity: null },
			{ name: 'Zahnbürste', quantity: null },
			{ name: 'Handtuch', quantity: null },
		])
	})

	test('strippt führenden Bindestrich', () => {
		expect(parseImportText('- Sonnencreme')).toEqual([{ name: 'Sonnencreme', quantity: null }])
	})

	test('strippt führenden Stern', () => {
		expect(parseImportText('* Sonnencreme')).toEqual([{ name: 'Sonnencreme', quantity: null }])
	})

	test('strippt führenden Bulletpoint', () => {
		expect(parseImportText('• Sonnencreme')).toEqual([{ name: 'Sonnencreme', quantity: null }])
	})

	test('strippt Nummerierung mit Punkt', () => {
		expect(parseImportText('1. Kompass')).toEqual([{ name: 'Kompass', quantity: null }])
	})

	test('strippt Nummerierung mit Klammer', () => {
		expect(parseImportText('2) Kompass')).toEqual([{ name: 'Kompass', quantity: null }])
	})

	test('strippt mehrstellige Nummerierung', () => {
		expect(parseImportText('12. Kompass')).toEqual([{ name: 'Kompass', quantity: null }])
	})

	test('strippt unchecked Markdown-Checkbox', () => {
		expect(parseImportText('[ ] Erste-Hilfe-Set')).toEqual([{ name: 'Erste-Hilfe-Set', quantity: null }])
	})

	test('strippt checked Markdown-Checkbox', () => {
		expect(parseImportText('[x] Erste-Hilfe-Set')).toEqual([{ name: 'Erste-Hilfe-Set', quantity: null }])
	})

	test('strippt checked Markdown-Checkbox unabhängig von Groß-/Kleinschreibung', () => {
		expect(parseImportText('[X] Erste-Hilfe-Set')).toEqual([{ name: 'Erste-Hilfe-Set', quantity: null }])
	})

	test('strippt Bindestrich und Checkbox kombiniert', () => {
		expect(parseImportText('- [x] Zelt')).toEqual([{ name: 'Zelt', quantity: null }])
	})

	test('erkennt Mengen-Präfix ohne Leerzeichen vor x', () => {
		expect(parseImportText('3x T-Shirt')).toEqual([{ name: 'T-Shirt', quantity: 3 }])
	})

	test('erkennt Mengen-Präfix mit Leerzeichen vor x', () => {
		expect(parseImportText('3 x T-Shirt')).toEqual([{ name: 'T-Shirt', quantity: 3 }])
	})

	test('erkennt Mengen-Präfix ohne x', () => {
		expect(parseImportText('2 Handtücher')).toEqual([{ name: 'Handtücher', quantity: 2 }])
	})

	test('quantity ist null ohne führende Zahl', () => {
		expect(parseImportText('T-Shirt 3x')).toEqual([{ name: 'T-Shirt 3x', quantity: null }])
	})

	test('kombiniert Bullet und Mengen-Präfix', () => {
		expect(parseImportText('- 3x Batterien')).toEqual([{ name: 'Batterien', quantity: 3 }])
	})

	test('trimmt Whitespace', () => {
		expect(parseImportText('   Sonnencreme   ')).toEqual([{ name: 'Sonnencreme', quantity: null }])
	})

	test('überspringt leere Zeilen', () => {
		expect(parseImportText('Sonnencreme\n\n\nZahnbürste')).toEqual([
			{ name: 'Sonnencreme', quantity: null },
			{ name: 'Zahnbürste', quantity: null },
		])
	})

	test('überspringt Zeilen ohne Buchstaben oder Zahlen', () => {
		expect(parseImportText('Sonnencreme\n-----\n***\nZahnbürste')).toEqual([
			{ name: 'Sonnencreme', quantity: null },
			{ name: 'Zahnbürste', quantity: null },
		])
	})

	test('behält Zahl als Name wenn nichts danach folgt', () => {
		expect(parseImportText('42')).toEqual([{ name: '42', quantity: null }])
	})

	test('keine Deduplizierung gleicher Einträge', () => {
		expect(parseImportText('Socken\nSocken')).toEqual([
			{ name: 'Socken', quantity: null },
			{ name: 'Socken', quantity: null },
		])
	})

	test('leerer Text ergibt leere Liste', () => {
		expect(parseImportText('')).toEqual([])
	})
})
