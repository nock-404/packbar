import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getListWithContent } from '@/lib/dal/lists'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
	const list = await getListWithContent(id, session.user.id)
	if (!list) return NextResponse.json({ error: 'not_found' }, { status: 404 })
	return NextResponse.json(list)
}
