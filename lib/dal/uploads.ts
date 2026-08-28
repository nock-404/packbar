import 'server-only'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { and, desc, eq } from 'drizzle-orm'
import sharp from 'sharp'
import { db } from '@/lib/db'
import { lists, uploads } from '@/lib/db/schema'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUploadId(id: string): boolean {
	return UUID_PATTERN.test(id)
}

function uploadDir(): string {
	return process.env.UPLOAD_DIR ?? './data/uploads'
}

function uploadFilePath(id: string): string {
	return path.join(uploadDir(), `${id}.webp`)
}

export async function saveUpload(userId: string, buffer: Buffer): Promise<{ id: string }> {
	const id = crypto.randomUUID()
	const processed = await sharp(buffer)
		.resize({ width: 1600, withoutEnlargement: true })
		.webp({ quality: 80 })
		.toBuffer()

	await mkdir(uploadDir(), { recursive: true })
	await writeFile(uploadFilePath(id), processed)

	await db.insert(uploads).values({ id, userId })

	return { id }
}

export async function listUploads(userId: string): Promise<string[]> {
	const rows = await db.query.uploads.findMany({
		where: eq(uploads.userId, userId),
		orderBy: desc(uploads.createdAt),
		columns: { id: true },
	})
	return rows.map(row => row.id)
}

export async function readUploadFile(id: string): Promise<Buffer | null> {
	if (!isValidUploadId(id)) return null
	try {
		return await readFile(uploadFilePath(id))
	} catch {
		return null
	}
}

export async function deleteUpload(id: string, userId: string): Promise<void> {
	const row = await db.query.uploads.findFirst({
		where: and(eq(uploads.id, id), eq(uploads.userId, userId)),
		columns: { id: true },
	})
	if (!row) throw new Error('not_found')

	await rm(uploadFilePath(id), { force: true })
	await db.delete(uploads).where(eq(uploads.id, id))
	await db
		.update(lists)
		.set({ coverImage: null })
		.where(and(eq(lists.userId, userId), eq(lists.coverImage, `custom:${id}`)))
}
