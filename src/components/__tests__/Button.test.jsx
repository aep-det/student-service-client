import { fireEvent, render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with default variant and handles click', async () => {
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveClass('btn', 'btn-primary')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders with a custom variant', () => {
    render(<Button variant="secondary">Cancel</Button>)

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass(
      'btn-secondary'
    )
  })
})
