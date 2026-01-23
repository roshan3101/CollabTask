"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { verifyLoginOtp, loginUser } from "@/stores/slices/auth.slice"
import LoginForm from "./components/login-form"
import LoginOtpForm from "./components/login-otp-form"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { otpStep, otpEmail, isLoading, error, accessToken, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken && user) {
      router.push("/onboarding")
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
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-foreground/60">
            {otpStep === "otp" ? "Enter the OTP sent to your email" : "Sign in to CollabTask and get productive"}
          </p>
        </div>

        {/* Login Card */}
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
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
          </div>
        </div>

        {/* Sign Up Link */}
        {otpStep !== "otp" && (
          <div className="text-center">
            <p className="text-foreground/60">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-semibold">
                Sign up for free
              </Link>
            </p>
          </div>
        )}
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
