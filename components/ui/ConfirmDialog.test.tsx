import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/messages/de.json'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
	it('fires onConfirm when confirm button is clicked', () => {
		const onConfirm = vi.fn()
		const onClose = vi.fn()
		render(
			<NextIntlClientProvider locale="de" messages={messages}>
				<ConfirmDialog
					open
					onClose={onClose}
					onConfirm={onConfirm}
					title="Liste löschen"
					message="Wirklich löschen?"
				/>
			</NextIntlClientProvider>,
		)

		fireEvent.click(screen.getByRole('button', { name: 'Bestätigen' }))

		expect(onConfirm).toHaveBeenCalledTimes(1)
	})

	it('uses a custom confirm label and fires onClose on cancel', () => {
		const onConfirm = vi.fn()
		const onClose = vi.fn()
		render(
			<NextIntlClientProvider locale="de" messages={messages}>
				<ConfirmDialog
					open
					onClose={onClose}
					onConfirm={onConfirm}
					title="Liste löschen"
					message="Wirklich löschen?"
					confirmLabel="Löschen"
					destructive
				/>
			</NextIntlClientProvider>,
		)

		fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }))

		expect(onClose).toHaveBeenCalledTimes(1)
		expect(onConfirm).not.toHaveBeenCalled()
		expect(screen.getByRole('button', { name: 'Löschen' })).toBeInTheDocument()
	})
})
