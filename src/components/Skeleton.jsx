export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
    />
  )
}

export function TableSkeleton({ columns, rows = 5 }) {
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
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key}>
                  <Skeleton style={{ height: '20px', width: c.width || '100%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cardish">
          <Skeleton style={{ height: '16px', width: '60%', marginBottom: '12px' }} />
          <Skeleton style={{ height: '32px', width: '40%' }} />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 300 }) {
  return (
    <div className="cardish">
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
        <Skeleton style={{ height: '18px', width: '60%' }} />
      </h3>
      <Skeleton style={{ height: `${height}px`, width: '100%', borderRadius: '8px' }} />
    </div>
  )
}
