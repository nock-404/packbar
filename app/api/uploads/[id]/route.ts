import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { deleteUpload, readUploadFile } from '@/lib/dal/uploads'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const file = await readUploadFile(id)
	if (!file) return NextResponse.json({ error: 'not_found' }, { status: 404 })
	return new NextResponse(new Uint8Array(file), {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

	try {
		await deleteUpload(id, session.user.id)
	} catch {
		return NextResponse.json({ error: 'not_found' }, { status: 404 })
	}

	return NextResponse.json({ ok: true })
}
