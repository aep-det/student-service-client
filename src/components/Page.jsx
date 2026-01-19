export function Page({ title, actions, children }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
      <div className="page-body">{children}</div>
    </div>
  )
}
