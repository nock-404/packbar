import 'server-only'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { lists, categories, items } from '@/lib/db/schema'
import { user } from '@/lib/db/auth-schema'
import { sendAppEmail } from '@/lib/mailer'
import { lastMinuteEmail } from '@/lib/emails'

export async function runLastMinuteMailing(today: string): Promise<{ sent: number }> {
	const dueLists = await db
		.select({ id: lists.id, name: lists.name, userId: lists.userId })
		.from(lists)
		.where(and(eq(lists.tripDate, today), isNull(lists.lastMinuteMailSentAt)))

	let sent = 0

	for (const list of dueLists) {
		const openItems = await db
			.select({ name: items.name })
			.from(items)
			.innerJoin(categories, eq(items.categoryId, categories.id))
			.where(and(eq(categories.listId, list.id), eq(items.lastMinute, true), eq(items.packed, false)))

		if (openItems.length === 0) continue

		const owner = await db.query.user.findFirst({
			where: eq(user.id, list.userId),
			columns: { email: true },
		})
		if (!owner) continue

		const mail = await lastMinuteEmail(list.name, openItems.map(item => item.name))
		await sendAppEmail({ to: owner.email, ...mail })

		await db.update(lists).set({ lastMinuteMailSentAt: new Date() }).where(eq(lists.id, list.id))

		sent += 1
	}

	return { sent }
}
