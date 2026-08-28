import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { ThemeSwitch } from '@/components/theme/ThemeSwitch'
import { UserMenu } from './UserMenu'

type AppHeaderProps = {
	name: string
	email: string
}

export function AppHeader({ name, email }: AppHeaderProps) {
	return (
		<header className="border-b border-line bg-surface-raised print:hidden">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
				<Link href="/dashboard" className="inline-flex items-center">
					<Logo />
				</Link>
				<div className="flex items-center gap-2">
					<ThemeSwitch />
					<UserMenu name={name} email={email} />
				</div>
			</div>
		</header>
	)
}
