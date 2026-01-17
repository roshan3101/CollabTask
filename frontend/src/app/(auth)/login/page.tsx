"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { verifyLoginOtp, loginUser } from "@/stores/slices/auth.slice"
import LoginForm from "./components/login-form"
import LoginOtpForm from "./components/login-otp-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { otpStep, otpEmail, isLoading, error, accessToken, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken && user) {
      router.push("/")
    }
  }, [accessToken, user, router])

  const handleLogin = async (email: string, password: string) => {
    await dispatch(loginUser({ email, password }))
  }

  const handleVerifyOtp = async (otp: string) => {
    if (otpEmail) {
      await dispatch(verifyLoginOtp({ email: otpEmail, otp }))
    }
  }


  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              {otpStep === "otp" ? "Enter the OTP sent to your email" : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otpStep === "otp" ? (
              <LoginOtpForm
                email={otpEmail || ""}
                onVerify={handleVerifyOtp}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <LoginForm
                onLogin={handleLogin}
                isLoading={isLoading}
                error={error}
              />
            )}
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
