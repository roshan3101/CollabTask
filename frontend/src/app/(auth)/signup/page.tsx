"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { signupUser, verifySignupOtp } from "@/stores/slices/auth.slice"
import SignupForm from "./components/signup-form"
import SignupOtpForm from "./components/signup-otp-form"
import Link from "next/link"
import * as z from "zod"
import { signupSchema } from "@/types/auth"

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { otpStep, otpEmail, isLoading, error, accessToken, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken && user) {
      router.push("/onboarding")
    }
  }, [accessToken, user, router])

  const handleSignup = async (data: SignupFormValues) => {
    const signupData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password
    }
    await dispatch(signupUser(signupData))
  }

  const handleVerifyOtp = async (otp: string) => {
    if (otpEmail) {
      await dispatch(verifySignupOtp({ email: otpEmail, otp }))
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
            Create Account
          </h1>
          <p className="text-foreground/60">
            {otpStep === "otp" ? "Verify your email with OTP" : "Sign up to CollabTask and get started"}
          </p>
        </div>

        {/* Signup Card */}
        <div className="relative mb-8 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            {otpStep === "otp" ? (
              <SignupOtpForm email={otpEmail || ""} onVerify={handleVerifyOtp} isLoading={isLoading} error={error} />
            ) : (
              <SignupForm onSignup={handleSignup} isLoading={isLoading} error={error} />
            )}
          </div>
        </div>

        {/* Sign In Link */}
        {otpStep !== "otp" && (
          <div className="text-center">
            <p className="text-foreground/60">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold">
                Sign in
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
