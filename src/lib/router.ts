export function route<T extends string>(path: T) {
  return path as T
}

export function routeWithParams<T extends string>(
  path: T,
  params?: Record<string, string | number>,
): string {
  if (!params) return path

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value))
  })

  return `${path}?${searchParams.toString()}`
}
