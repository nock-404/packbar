import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/messages/de.json'
import { Dialog } from './Dialog'
import { Input } from './Input'

function renderDialog(open: boolean, onClose: () => void) {
	return render(
		<NextIntlClientProvider locale="de" messages={messages}>
			<Dialog open={open} onClose={onClose} title="Testdialog">
				<p>Inhalt</p>
			</Dialog>
		</NextIntlClientProvider>,
	)
}

describe('Dialog', () => {
	it('renders title and children when open', () => {
		renderDialog(true, vi.fn())

		expect(screen.getByText('Testdialog')).toBeInTheDocument()
		expect(screen.getByText('Inhalt')).toBeInTheDocument()
	})

	it('renders nothing when closed', () => {
		renderDialog(false, vi.fn())

		expect(screen.queryByText('Testdialog')).not.toBeInTheDocument()
	})

	it('closes on Escape', () => {
		const onClose = vi.fn()
		renderDialog(true, onClose)

		fireEvent.keyDown(document, { key: 'Escape' })

		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('keeps focus in the dialog when onClose identity changes', () => {
		const { rerender } = render(
			<NextIntlClientProvider locale="de" messages={messages}>
				<Dialog open onClose={() => {}} title="Testdialog">
					<Input aria-label="Feld" />
				</Dialog>
			</NextIntlClientProvider>,
		)

		const input = screen.getByLabelText('Feld')
		input.focus()

		rerender(
			<NextIntlClientProvider locale="de" messages={messages}>
				<Dialog open onClose={() => {}} title="Testdialog">
					<Input aria-label="Feld" />
				</Dialog>
			</NextIntlClientProvider>,
		)

		expect(input).toHaveFocus()
	})
})
