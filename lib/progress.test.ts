import { describe, expect, test } from 'vitest'
import { computeProgress, listProgress, categoryProgress } from './progress'

const item = (packed: boolean) => ({ packed })

describe('computeProgress', () => {
	test('zählt gepackte und gesamt', () => {
		expect(computeProgress([item(true), item(false), item(true)])).toEqual({ packed: 2, total: 3 })
	})
	test('leere Liste', () => {
		expect(computeProgress([])).toEqual({ packed: 0, total: 0 })
	})
})

describe('listProgress', () => {
	test('summiert über Kategorien und Unterkategorien', () => {
		const list = {
			categories: [
				{ items: [item(true)], children: [{ items: [item(false), item(true)] }] },
				{ items: [], children: [] },
			],
		}
		expect(listProgress(list as never)).toEqual({ packed: 2, total: 3 })
	})
})

describe('categoryProgress', () => {
	test('summiert Kategorie inkl. Kinder', () => {
		const cat = { items: [item(false)], children: [{ items: [item(true)] }] }
		expect(categoryProgress(cat as never)).toEqual({ packed: 1, total: 2 })
	})
})
