import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { listUploads, saveUpload } from '@/lib/dal/uploads'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
	const ids = await listUploads(session.user.id)
	return NextResponse.json(ids)
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

	const formData = await request.formData()
	const file = formData.get('file')
	if (!(file instanceof File)) return NextResponse.json({ error: 'missing_file' }, { status: 400 })
	if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'invalid_type' }, { status: 400 })
	if (file.size > MAX_SIZE) return NextResponse.json({ error: 'too_large' }, { status: 413 })

	const buffer = Buffer.from(await file.arrayBuffer())
	const { id } = await saveUpload(session.user.id, buffer)
	return NextResponse.json({ id })
}
