"use client"

import React, { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "./store"
import { storageUtils } from "@/lib/storage"

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const accessToken = storageUtils.getAccessToken()
    const refreshToken = storageUtils.getRefreshToken()
    const user = storageUtils.getUser()

    if (accessToken && user) {
      const authState = {
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        error: null,
        otpStep: null,
        otpEmail: null,
        forgotPasswordEmail: null,
      }
      

      store.dispatch({
        type: "auth/restoreFromStorage",
        payload: authState,
      })
    }
  }, [])

  return <>{children}</>
}

export default function ReduxProvider ({
    children
} : {
    children: React.ReactNode
}) {
    return (
      <Provider store={store}>
        <AuthInitializer>{children}</AuthInitializer>
      </Provider>
    )
}