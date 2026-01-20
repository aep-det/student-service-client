import { fireEvent, render, screen } from '@testing-library/react'
import { Table } from '../Table'

const columns = [
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => `Status: ${row.status}`,
  },
]

describe('Table', () => {
  it('renders headers and rows', () => {
    const rows = [
      { id: 1, name: 'Intro to React', status: 'open' },
      { id: 2, name: 'Node Basics', status: 'closed' },
    ]

    render(<Table columns={columns} rows={rows} />)

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Status' })
    ).toBeInTheDocument()
    expect(screen.getByText('Intro to React')).toBeInTheDocument()
    expect(screen.getByText('Status: closed')).toBeInTheDocument()
  })

  it('renders empty state when no rows', () => {
    render(<Table columns={columns} rows={[]} />)

    const emptyCell = screen.getByText('No results')
    expect(emptyCell).toHaveClass('table-empty')
    expect(emptyCell.closest('td')).toHaveAttribute('colspan', '2')
  })

  it('handles row clicks', () => {
    const rows = [{ id: 1, name: 'Intro to React', status: 'open' }]
    const onRowClick = vi.fn()

    render(<Table columns={columns} rows={rows} onRowClick={onRowClick} />)

    const row = screen.getByText('Intro to React').closest('tr')
    fireEvent.click(row)

    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })
})
