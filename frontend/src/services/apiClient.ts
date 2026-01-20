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
    storageUtils.clearAuthAndRedirectToLogin()
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

      if (!res.ok || !data?.success || !data?.data) {
        storageUtils.clearAuthAndRedirectToLogin()
        throw new Error(data?.message || data?.detail || "Failed to refresh token")
      }

      // Backend returns snake_case: access_token and refresh_token
      const newAccessToken: string | undefined = data.data.access_token
      const newRefreshToken: string | undefined = data.data.refresh_token

      if (!newAccessToken || !newRefreshToken) {
        storageUtils.clearAuthAndRedirectToLogin()
        throw new Error("Invalid token response from server")
      }

      // Update stored tokens
      storageUtils.setAccessToken(newAccessToken)
      storageUtils.setRefreshToken(newRefreshToken)
    } catch (error) {
      // On any error, clear auth and redirect to login to prevent retry loops
      storageUtils.clearAuthAndRedirectToLogin()
      throw error
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  try {
    await refreshPromise
    return storageUtils.getAccessToken()
  } catch {
    // Refresh failed, return null
    return null
  }
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

function isSessionExpiredError(data: any): boolean {
  if (!data) return false
  
  const message = (data as any)?.message || (data as any)?.detail || ""
  const messageLower = message.toLowerCase()
  
  return (
    messageLower.includes("session expired") ||
    messageLower.includes("token has expired") ||
    messageLower.includes("token expired") ||
    messageLower.includes("authentication required") ||
    messageLower.includes("invalid token") ||
    messageLower.includes("token invalid")
  )
}

async function request<T>(
  method: HttpMethod,
  url: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  const maxRetries = 3
  let retryCount = 0
  let currentToken = token

  try {
    while (retryCount <= maxRetries) {
      // Attempt request
      let { res, data } = await doFetch<T>(method, url, body, currentToken, controller.signal)

      // Check if it's a 401 with session expired error
      // Skip refresh for auth endpoints to prevent infinite loops
      if (
        res.status === 401 &&
        !token &&
        !url.startsWith('/auth/') &&
        isSessionExpiredError(data) &&
        retryCount < maxRetries
      ) {
        retryCount++
        const newToken = await refreshAccessToken()

        if (newToken) {
          // Retry with new token
          currentToken = newToken
          continue
        } else {
          // Refresh failed - tokens already cleared & redirect triggered
          const error: ApiError = new Error("Session expired. Please login again.")
          error.status = 401
          error.data = data
          throw error
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
    }

    // If we've exhausted retries, throw an error
    const error: ApiError = new Error("Session expired. Please login again.")
    error.status = 401
    throw error
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