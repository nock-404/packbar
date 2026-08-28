import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getListWithContent } from '@/lib/dal/lists'
import { AutoPrintTrigger } from '@/components/lists/AutoPrintTrigger'
import { PrintView } from '@/components/lists/PrintView'

export default async function ListPrintPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) redirect('/login')

	const list = await getListWithContent(id, session.user.id)
	if (!list) notFound()

	return (
		<>
			<AutoPrintTrigger />
			<PrintView list={list} />
		</>
	)
}
