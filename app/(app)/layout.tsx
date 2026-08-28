import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppFooter } from '@/components/layout/AppFooter'

export default async function AppLayout({ children }: { children: ReactNode }) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) redirect('/login')

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader name={session.user.name} email={session.user.email} />
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
			<AppFooter />
		</div>
	)
}
