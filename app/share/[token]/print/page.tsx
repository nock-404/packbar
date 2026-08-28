import { notFound } from 'next/navigation'
import { getSharedList } from '@/lib/dal/share'
import { AutoPrintTrigger } from '@/components/lists/AutoPrintTrigger'
import { PrintView } from '@/components/lists/PrintView'

export default async function SharedListPrintPage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params
	const shared = await getSharedList(token)
	if (!shared) notFound()

	return (
		<>
			<AutoPrintTrigger />
			<PrintView list={shared.list} />
		</>
	)
}
