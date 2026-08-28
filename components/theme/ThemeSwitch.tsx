'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { TbDeviceDesktop, TbMoon, TbSunHigh } from 'react-icons/tb'
import { Dropdown } from '@/components/ui/Dropdown'
import { IconButton } from '@/components/ui/IconButton'

const emptySubscribe = () => () => {}

export function ThemeSwitch() {
	const t = useTranslations('theme')
	const { theme, setTheme } = useTheme()
	const mounted = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	)

	if (!mounted) {
		return (
			<IconButton label={t('label')} disabled>
				<TbDeviceDesktop />
			</IconButton>
		)
	}

	const icon = theme === 'light' ? <TbSunHigh /> : theme === 'dark' ? <TbMoon /> : <TbDeviceDesktop />

	return (
		<Dropdown
			trigger={<IconButton label={t('label')}>{icon}</IconButton>}
			items={[
				{ icon: <TbDeviceDesktop />, label: t('system'), onSelect: () => setTheme('system') },
				{ icon: <TbSunHigh />, label: t('light'), onSelect: () => setTheme('light') },
				{ icon: <TbMoon />, label: t('dark'), onSelect: () => setTheme('dark') },
			]}
		/>
	)
}
