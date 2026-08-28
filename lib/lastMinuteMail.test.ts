import { describe, expect, test } from 'vitest'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/auth-schema'
import { lists } from '@/lib/db/schema'
import { createList, updateList } from './dal/lists'
import { createCategory, createItem, updateItem } from './dal/content'
import { runLastMinuteMailing } from './lastMinuteMail'

const uid = () => crypto.randomUUID()

async function makeUser() {
	const id = uid()
	await db.insert(user).values({
		id,
		name: 'Test',
		email: `${id}@test.local`,
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	})
	return id
}

function randomFutureDate(): string {
	const year = 2030 + Math.floor(Math.random() * 60)
	const month = 1 + Math.floor(Math.random() * 12)
	const day = 1 + Math.floor(Math.random() * 28)
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

describe('runLastMinuteMailing', () => {
	test('verschickt eine Mail fuer offene Last-Minute-Items am Reisetag und markiert die Liste', async () => {
		const userId = await makeUser()
		const list = await createList(userId, 'Kroatien', { kind: 'empty' })
		const tripDate = randomFutureDate()
		await updateList(list.id, userId, { tripDate })
		const cat = await createCategory(list.id, userId, 'Technik', null)
		const item = await createItem(cat.id, userId, 'Handy-Ladekabel')
		await updateItem(item.id, userId, { lastMinute: true })

		const result = await runLastMinuteMailing(tripDate)
		expect(result.sent).toBe(1)

		const updated = await db.query.lists.findFirst({ where: eq(lists.id, list.id) })
		expect(updated!.lastMinuteMailSentAt).not.toBeNull()
	})

	test('verschickt beim zweiten Aufruf keine weitere Mail fuer dieselbe Liste', async () => {
		const userId = await makeUser()
		const list = await createList(userId, 'Kroatien 2', { kind: 'empty' })
		const tripDate = randomFutureDate()
		await updateList(list.id, userId, { tripDate })
		const cat = await createCategory(list.id, userId, 'Technik', null)
		const item = await createItem(cat.id, userId, 'Handy')
		await updateItem(item.id, userId, { lastMinute: true })

		const first = await runLastMinuteMailing(tripDate)
		expect(first.sent).toBe(1)

		const second = await runLastMinuteMailing(tripDate)
		expect(second.sent).toBe(0)
	})

	test('ignoriert Listen ohne offene Last-Minute-Items', async () => {
		const userId = await makeUser()
		const list = await createList(userId, 'Ohne', { kind: 'empty' })
		const tripDate = randomFutureDate()
		await updateList(list.id, userId, { tripDate })
		const cat = await createCategory(list.id, userId, 'Technik', null)
		const item = await createItem(cat.id, userId, 'Handy')
		await updateItem(item.id, userId, { lastMinute: true, packed: true })

		const result = await runLastMinuteMailing(tripDate)
		expect(result.sent).toBe(0)

		const updated = await db.query.lists.findFirst({ where: eq(lists.id, list.id) })
		expect(updated!.lastMinuteMailSentAt).toBeNull()
	})

	test('ignoriert Listen mit einem anderen Reisedatum', async () => {
		const userId = await makeUser()
		const list = await createList(userId, 'Anders', { kind: 'empty' })
		const tripDate = randomFutureDate()
		await updateList(list.id, userId, { tripDate })
		const cat = await createCategory(list.id, userId, 'Technik', null)
		const item = await createItem(cat.id, userId, 'Handy')
		await updateItem(item.id, userId, { lastMinute: true })

		const otherDate = randomFutureDate()
		const result = await runLastMinuteMailing(otherDate)

		const updated = await db.query.lists.findFirst({ where: eq(lists.id, list.id) })
		expect(updated!.lastMinuteMailSentAt).toBeNull()
		expect(result.sent).toBe(0)
	})
})
