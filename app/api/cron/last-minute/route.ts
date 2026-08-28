import { NextResponse } from 'next/server'
import { runLastMinuteMailing } from '@/lib/lastMinuteMail'

function localToday(): string {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export async function GET(request: Request) {
	const key = new URL(request.url).searchParams.get('key')
	if (key !== process.env.CRON_SECRET) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

	const result = await runLastMinuteMailing(localToday())
	return NextResponse.json(result)
}
