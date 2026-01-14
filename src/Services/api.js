export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token")

  const API_URL = import.meta.env.VITE_API_URL

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Error en la petición")
  }

  return data
}
