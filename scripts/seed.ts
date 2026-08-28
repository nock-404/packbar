import 'dotenv/config'
import { and, eq } from 'drizzle-orm'
import { APIError } from 'better-auth'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/auth-schema'
import { lists, categories, items, persons } from '@/lib/db/schema'
import { defaultTemplate } from '@/lib/default-template'
import { templateToRows } from '@/lib/template'

const DEV_EMAIL = 'dev@packbar.local'
const DEV_PASSWORD = 'packbar1234'
const LIST_NAME = 'Kroatien Roadtrip'

async function ensureDevUser() {
	try {
		await auth.api.signUpEmail({
			body: {
				email: DEV_EMAIL,
				password: DEV_PASSWORD,
				name: 'Dev User',
			},
		})
	} catch (error) {
		const alreadyExists = error instanceof APIError && error.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
		if (!alreadyExists) throw error
	}

	await db.update(user).set({ emailVerified: true }).where(eq(user.email, DEV_EMAIL))

	const devUser = await db.query.user.findFirst({ where: eq(user.email, DEV_EMAIL) })
	if (!devUser) throw new Error('Dev-User konnte nach dem Anlegen nicht gefunden werden')
	return devUser
}

function tripDateInDays(days: number) {
	const date = new Date()
	date.setDate(date.getDate() + days)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

async function main() {
	const devUser = await ensureDevUser()

	const existingList = await db.query.lists.findFirst({
		where: and(eq(lists.userId, devUser.id), eq(lists.name, LIST_NAME)),
	})
	if (existingList) {
		console.info('Liste "Kroatien Roadtrip" existiert bereits, Seed übersprungen')
		return
	}

	const listId = crypto.randomUUID()
	const rows = templateToRows(listId, defaultTemplate)

	await db.insert(lists).values({
		id: listId,
		userId: devUser.id,
		name: LIST_NAME,
		destination: 'Kroatien',
		tripDate: tripDateInDays(30),
	})

	if (rows.persons.length > 0) await db.insert(persons).values(rows.persons)
	await db.insert(categories).values(rows.categories)
	await db.insert(items).values(rows.items)

	console.info(`Seed abgeschlossen: Liste "${LIST_NAME}" mit ${rows.categories.length} Kategorien und ${rows.items.length} Items angelegt`)
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
