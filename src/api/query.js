export function toQueryString(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === undefined || v === null || v === '') return
        searchParams.append(key, String(v))
      })
      return
    }

    searchParams.set(key, String(value))
  })

  const s = searchParams.toString()
  return s ? `?${s}` : ''
}

export function pageableQuery({ page = 0, size = 20, sort } = {}) {
  // Spring-style paging: ?page=0&size=20&sort=field,asc
  return {
    page,
    size,
    ...(sort ? { sort } : {}),
  }
}
