import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { CoverStrip } from '@/components/marketing/CoverStrip'
import { Demo } from '@/components/marketing/Demo'
import { Features } from '@/components/marketing/Features'
import { Hero } from '@/components/marketing/Hero'
import { LandingFooter } from '@/components/marketing/LandingFooter'

export default async function Home() {
	const session = await auth.api.getSession({ headers: await headers() })

	return (
		<>
			<main>
				<Hero authenticated={Boolean(session)} />
				<Features />
				<Demo />
				<CoverStrip />
			</main>
			<LandingFooter />
		</>
	)
}
