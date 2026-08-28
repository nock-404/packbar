import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
	it('fires onCheckedChange with true when unchecked checkbox is clicked', () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />)

		fireEvent.click(screen.getByRole('checkbox'))

		expect(onCheckedChange).toHaveBeenCalledTimes(1)
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	it('fires onCheckedChange with false when checked checkbox is clicked', () => {
		const onCheckedChange = vi.fn()
		render(<Checkbox checked onCheckedChange={onCheckedChange} />)

		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toHaveAttribute('aria-checked', 'true')

		fireEvent.click(checkbox)

		expect(onCheckedChange).toHaveBeenCalledWith(false)
	})
})
