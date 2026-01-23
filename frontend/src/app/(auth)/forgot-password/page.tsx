"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { forgotPassword, resetPassword, resetForgotPasswordFlow } from "@/stores/slices/auth.slice"
import ForgotPasswordEmailForm from "./components/forgot-password-email-form"
import ForgotPasswordOtpForm from "./components/forgot-password-otp-form"
import ForgotPasswordResetForm from "./components/forgot-password-reset-form"
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

  const getSubtitle = () => {
    if (resetVerified) return "Enter your new password"
    if (otpStep === "otp") return "Verify your email with OTP"
    return "Enter your email address to reset your password"
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-foreground/60">{getSubtitle()}</p>
        </div>

        {/* Content Card */}
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
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
              <ForgotPasswordEmailForm
                onSubmit={handleSubmitEmail}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>

        {/* Back to login */}
        <div className="text-center">
          <p className="text-foreground/60">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
