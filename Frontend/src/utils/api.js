const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '')

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed.')
    error.status = response.status
    throw error
  }

  return payload
}

export function exerciseMediaUrl(url) {
  if (!url || !url.startsWith('/uploads/')) return url
  return `${BACKEND_URL}${url}`
}
