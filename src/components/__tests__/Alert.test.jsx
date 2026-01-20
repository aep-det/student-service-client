import { render, screen } from '@testing-library/react'
import { Alert } from '../Alert'

describe('Alert', () => {
  it('renders children with default type', () => {
    render(<Alert>Saved!</Alert>)

    expect(screen.getByText('Saved!')).toHaveClass('alert', 'alert-info')
  })

  it('renders with a custom type', () => {
    render(<Alert type="error">Failed</Alert>)

    expect(screen.getByText('Failed')).toHaveClass('alert-error')
  })
})
