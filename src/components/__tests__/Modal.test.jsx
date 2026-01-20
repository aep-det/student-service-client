import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from '../Modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal title="Details" open={false} onClose={vi.fn()}>
        Body
      </Modal>
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders content and closes on backdrop click', () => {
    const onClose = vi.fn()

    render(
      <Modal title="Details" open onClose={onClose}>
        Body
      </Modal>
    )

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Details'
    )
    expect(screen.getByText('Body')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside modal', () => {
    const onClose = vi.fn()

    render(
      <Modal title="Details" open onClose={onClose}>
        Body
      </Modal>
    )

    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
