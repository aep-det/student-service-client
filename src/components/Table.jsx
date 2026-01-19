export function Table({ columns, rows, keyField = 'id', onRowClick }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((r) => (
              <tr
                key={r[keyField] ?? JSON.stringify(r)}
                className={onRowClick ? 'table-row-clickable' : undefined}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
