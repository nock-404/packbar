'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { TbLogout } from 'react-icons/tb'
import { authClient } from '@/lib/auth-client'
import { Dropdown } from '@/components/ui/Dropdown'

type UserMenuProps = {
	name: string
	email: string
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean)
	if (parts.length === 0) return '?'
	if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
	return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase()
}

export function UserMenu({ name, email }: UserMenuProps) {
	const t = useTranslations('layout.userMenu')
	const router = useRouter()

	const onSignOut = async () => {
		await authClient.signOut()
		router.push('/login')
	}

	return (
		<Dropdown
			trigger={
				<button
					type="button"
					aria-label={t('label')}
					className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
				>
					{initials(name)}
				</button>
			}
			header={email}
			items={[{ icon: <TbLogout />, label: t('signOut'), onSelect: onSignOut }]}
		/>
	)
}
