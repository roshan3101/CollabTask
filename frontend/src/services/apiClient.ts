import { storageUtils } from "@/lib/storage"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface ApiError extends Error {
  status?: number
  data?: any
}

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const currentAccessToken = storageUtils.getAccessToken()
  const refreshToken = storageUtils.getRefreshToken()

  if (!currentAccessToken || !refreshToken) {
    return null
  }

  if (isRefreshing && refreshPromise) {
    await refreshPromise
    return storageUtils.getAccessToken()
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentAccessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.data) {
        throw new Error(data?.message || data?.detail || "Failed to refresh token")
      }

      const newAccessToken: string | undefined =
        data.data.accessToken || data.data.access_token
      const newRefreshToken: string | undefined =
        data.data.refreshToken || data.data.refresh_token

      if (newAccessToken) {
        storageUtils.setAccessToken(newAccessToken)
      }
      if (newRefreshToken) {
        storageUtils.setRefreshToken(newRefreshToken)
      }
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  await refreshPromise
  return storageUtils.getAccessToken()
}

async function doFetch<T>(
  method: HttpMethod,
  url: string,
  body: unknown,
  token?: string,
  signal?: AbortSignal
): Promise<{ res: Response; data: T | null }> {
  const authToken = token || storageUtils.getAccessToken()

  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  const data = (await res.json().catch(() => null)) as T | null
  return { res, data }
}

async function request<T>(
  method: HttpMethod,
  url: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    // First attempt
    let { res, data } = await doFetch<T>(method, url, body, token, controller.signal)

    // Try automatic refresh on 401 (only when not using an explicit token override)
    if (res.status === 401 && !token) {
      const newToken = await refreshAccessToken()

      if (newToken) {
        ;({ res, data } = await doFetch<T>(
          method,
          url,
          body,
          newToken,
          controller.signal
        ))
      }
    }

    if (!res.ok) {
      const error: ApiError = new Error(
        (data as any)?.message || (data as any)?.detail || "Request failed"
      )
      error.status = res.status
      error.data = data
      throw error
    }

    return data as T
  } finally {
    clearTimeout(timeout)
  }
}

export const apiClient = {
  get:   <T>(url: string, token?: string) => request<T>("GET", url, undefined, token),
  post:  <T>(url: string, body?: unknown, token?: string) => request<T>("POST", url, body, token),
  put:   <T>(url: string, body?: unknown, token?: string) => request<T>("PUT", url, body, token),
  patch: <T>(url: string, body?: unknown, token?: string) => request<T>("PATCH", url, body, token),
  delete:<T>(url: string, body?: unknown, token?: string) => request<T>("DELETE", url, body, token),
}