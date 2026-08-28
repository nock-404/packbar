import type { Metadata } from 'next'
import { Bricolage_Grotesque, Instrument_Sans, Space_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { BodyScrollbars } from '@/components/scroll/BodyScrollbars'
import { RegisterSW } from '@/components/pwa/RegisterSW'
import 'overlayscrollbars/overlayscrollbars.css'
import './globals.css'

const bricolage = Bricolage_Grotesque({
	subsets: ['latin'],
	variable: '--font-bricolage',
})

const instrument = Instrument_Sans({
	subsets: ['latin'],
	variable: '--font-instrument',
})

const spaceMono = Space_Mono({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-space-mono',
})

export async function generateMetadata(): Promise<Metadata> {
	const tCommon = await getTranslations('common')
	const tManifest = await getTranslations('manifest')

	const appName = tCommon('appName')
	const description = tManifest('description')

	return {
		metadataBase: new URL(process.env.BETTER_AUTH_URL ?? 'http://localhost:4100'),
		title: {
			default: appName,
			template: `%s | ${appName}`,
		},
		description,
		openGraph: {
			title: appName,
			description,
			siteName: appName,
			type: 'website',
		},
	}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="de"
			suppressHydrationWarning
			data-overlayscrollbars-initialize=""
			className={`${bricolage.variable} ${instrument.variable} ${spaceMono.variable}`}
		>
			<body data-overlayscrollbars-initialize="" className="bg-surface font-sans text-ink antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<NextIntlClientProvider>
						<BodyScrollbars />
						<RegisterSW />
						{children}
					</NextIntlClientProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
