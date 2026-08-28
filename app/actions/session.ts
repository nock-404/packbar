import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function requireUserId(): Promise<string> {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) throw new Error('unauthorized')
	return session.user.id
}
