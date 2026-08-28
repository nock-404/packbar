import { NextResponse } from 'next/server'
import { getSharedList } from '@/lib/dal/share'

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
	const { token } = await params
	const shared = await getSharedList(token)
	if (!shared) return NextResponse.json({ error: 'not_found' }, { status: 404 })
	return NextResponse.json(shared)
}
