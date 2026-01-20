const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const USER_KEY = "user"

export const storageUtils = {
  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    }
  },

  getAccessToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    }
    return null
  },

  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    }
  },

  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    }
    return null
  },

  // User management
  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY)
      return user ? JSON.parse(user) : null
    }
    return null
  },

  // Clear all auth data
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  },

  clearAuthAndRedirectToLogin: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = "/login"
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem(ACCESS_TOKEN_KEY)
    }
    return false
  },
}
