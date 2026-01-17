"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { signupUser, verifySignupOtp } from "@/stores/slices/auth.slice"
import SignupForm from "./components/signup-form"
import SignupOtpForm from "./components/signup-otp-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      router.push("/")
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
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              {otpStep === "otp" ? "Verify your email with OTP" : "Sign up to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otpStep === "otp" ? (
              <SignupOtpForm email={otpEmail || ""} onVerify={handleVerifyOtp} isLoading={isLoading} error={error} />
            ) : (
              <SignupForm onSignup={handleSignup} isLoading={isLoading} error={error} />
            )}
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
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
