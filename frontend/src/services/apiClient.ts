import { storageUtils } from "@/lib/storage"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface ApiError extends Error {
    status?: number
    data?: any
}

async function request<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    token?: string
): Promise<T> {

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const authToken = token || storageUtils.getAccessToken()

    try {
        const res = await fetch(`${API_BASE_URL}${url}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        })

        const data = await res.json().catch(() => null)

        if(!res.ok) {
            const error: ApiError = new Error(
                data?.message || data?.detail || "Request failed"
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
    get: <T>(url: string, token?: string) => 
         request<T>("GET", url, undefined, token),

    post: <T>(url: string, body?: unknown, token?: string) =>
        request<T>("POST", url, body, token),

    put: <T>(url: string, body?: unknown, token?: string) =>
        request<T>("PUT", url, body, token),

    patch: <T>(url: string, body?: unknown, token?: string) =>
        request<T>("PATCH", url, body, token),

    delete: <T>(url: string, body?: unknown, token?: string) =>
        request<T>("DELETE", url, body, token),

}