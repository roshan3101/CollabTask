"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { forgotPassword, resetPassword, resetForgotPasswordFlow } from "@/stores/slices/auth.slice"
import ForgotPasswordEmailForm from "./components/forgot-password-email-form"
import ForgotPasswordOtpForm from "./components/forgot-password-otp-form"
import ForgotPasswordResetForm from "./components/forgot-password-reset-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { otpStep, forgotPasswordEmail, isLoading, error } = useAppSelector((state) => state.auth)
  const [resetVerified, setResetVerified] = useState(false)

  useEffect(() => {
    if (resetVerified && !otpStep && !forgotPasswordEmail && !error) {
      toast.success("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        dispatch(resetForgotPasswordFlow())
        router.push("/login")
      }, 2000)
    }
  }, [resetVerified, otpStep, forgotPasswordEmail, error, dispatch, router])

  const handleSubmitEmail = async (email: string) => {
    const result = await dispatch(forgotPassword({ email }))
    if (result.type === "auth/forgotPassword/fulfilled") {
      console.log("[v0] Email submitted, waiting for OTP")
    }
  }

  const [currentOtp, setCurrentOtp] = useState("")

  const handleVerifyOtp = async (otp: string) => {
    setCurrentOtp(otp)
    setResetVerified(true)
  }

  const handleResetPassword = async (newPassword: string) => {
    if (forgotPasswordEmail && currentOtp) {
      await dispatch(
        resetPassword({
          email: forgotPasswordEmail,
          otp: currentOtp,
          new_password: newPassword,
        }),
      )
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {resetVerified
                ? "Enter your new password"
                : otpStep === "otp"
                  ? "Verify your email with OTP"
                  : "Enter your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetVerified ? (
              <ForgotPasswordResetForm
                email={forgotPasswordEmail || ""}
                onResetPassword={handleResetPassword}
                isLoading={isLoading}
                error={error}
              />
            ) : otpStep === "otp" ? (
              <ForgotPasswordOtpForm
                email={forgotPasswordEmail || ""}
                onVerify={handleVerifyOtp}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <ForgotPasswordEmailForm onSubmit={handleSubmitEmail} isLoading={isLoading} error={error} />
            )}
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
