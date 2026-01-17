"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})

type OtpFormValues = z.infer<typeof otpSchema>

interface LoginOtpFormProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onBack?: () => void
  isLoading: boolean
  error: string | null
}

export default function LoginOtpForm({ email, onVerify, onBack, isLoading, error }: LoginOtpFormProps) {
  const [resendTimer, setResendTimer] = useState(60)
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  })

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  const onSubmit = async (values: OtpFormValues) => {
    try {
      await onVerify(values.otp)
      toast.success("Logged in successfully")
    } catch (err) {
      toast.error(error || "Verification failed")
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Enter the 6-digit OTP sent to</p>
        <p className="font-medium">{email}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex justify-center">
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || form.watch("otp").length !== 6}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      </Form>

      <div className="space-y-2">
        <Button variant="outline" className="w-full bg-transparent" disabled={resendTimer > 0}>
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </Button>
        {onBack && (
          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back
          </Button>
        )}
      </div>
    </div>
  )
}
