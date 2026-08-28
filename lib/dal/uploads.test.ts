import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import sharp from 'sharp'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/auth-schema'
import { lists } from '@/lib/db/schema'
import { createList, updateList } from './lists'
import { deleteUpload, isValidUploadId, listUploads, readUploadFile, saveUpload } from './uploads'

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

async function sampleImage(): Promise<Buffer> {
	return sharp({
		create: { width: 2000, height: 1000, channels: 3, background: { r: 20, g: 120, b: 140 } },
	})
		.jpeg()
		.toBuffer()
}

let previousUploadDir: string | undefined

beforeAll(async () => {
	previousUploadDir = process.env.UPLOAD_DIR
	process.env.UPLOAD_DIR = await mkdtemp(path.join(tmpdir(), 'packbar-uploads-'))
})

afterAll(async () => {
	if (process.env.UPLOAD_DIR) await rm(process.env.UPLOAD_DIR, { recursive: true, force: true })
	process.env.UPLOAD_DIR = previousUploadDir
})

describe('isValidUploadId', () => {
	test('akzeptiert nur uuids', () => {
		expect(isValidUploadId(crypto.randomUUID())).toBe(true)
		expect(isValidUploadId('../../etc/passwd')).toBe(false)
		expect(isValidUploadId('not-a-uuid')).toBe(false)
	})
})

describe('saveUpload', () => {
	test('verkleinert auf max 1600px Breite und kodiert als webp', async () => {
		const userId = await makeUser()
		const buffer = await sampleImage()
		const { id } = await saveUpload(userId, buffer)

		expect(isValidUploadId(id)).toBe(true)
		const stored = await readUploadFile(id)
		expect(stored).not.toBeNull()

		const meta = await sharp(stored!).metadata()
		expect(meta.format).toBe('webp')
		expect(meta.width).toBe(1600)
		expect(meta.height).toBe(800)
	})

	test('vergrößert kleine Bilder nicht', async () => {
		const userId = await makeUser()
		const small = await sharp({
			create: { width: 400, height: 300, channels: 3, background: { r: 10, g: 10, b: 10 } },
		})
			.jpeg()
			.toBuffer()
		const { id } = await saveUpload(userId, small)
		const stored = await readUploadFile(id)
		const meta = await sharp(stored!).metadata()
		expect(meta.width).toBe(400)
	})
})

describe('listUploads', () => {
	test('liefert nur eigene Uploads, neueste zuerst', async () => {
		const userA = await makeUser()
		const userB = await makeUser()
		const buffer = await sampleImage()
		const first = await saveUpload(userA, buffer)
		const second = await saveUpload(userA, buffer)
		await saveUpload(userB, buffer)

		const ids = await listUploads(userA)
		expect(ids).toEqual([second.id, first.id])
	})
})

describe('deleteUpload', () => {
	test('löscht Datei, Row und setzt coverImage von Listen des Users zurück', async () => {
		const userId = await makeUser()
		const buffer = await sampleImage()
		const { id } = await saveUpload(userId, buffer)
		const list = await createList(userId, 'Cover-Test', { kind: 'empty' })
		await updateList(list.id, userId, { coverImage: `custom:${id}` })

		await deleteUpload(id, userId)

		expect(await readUploadFile(id)).toBeNull()
		const updated = await db.query.lists.findFirst({ where: eq(lists.id, list.id) })
		expect(updated!.coverImage).toBeNull()
	})

	test('wirft not_found bei fremdem Upload und lässt Datei unangetastet', async () => {
		const owner = await makeUser()
		const stranger = await makeUser()
		const buffer = await sampleImage()
		const { id } = await saveUpload(owner, buffer)

		await expect(deleteUpload(id, stranger)).rejects.toThrow('not_found')
		expect(await readUploadFile(id)).not.toBeNull()
	})
})

describe('readUploadFile', () => {
	test('liefert null für unbekannte oder ungültige ids', async () => {
		expect(await readUploadFile(crypto.randomUUID())).toBeNull()
		expect(await readUploadFile('../../etc/passwd')).toBeNull()
	})
})
