export const DEFAULT_API_BASE_URL =
  'https://gleaming-rosabelle-tsi-uni-bfd33a9f.koyeb.app'

export function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
  return baseUrl.replace(/\/+$/, '')
}
