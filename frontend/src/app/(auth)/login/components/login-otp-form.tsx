"use client"

import { useState, useEffect, useRef } from "react"
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
  const prevIsLoadingRef = useRef(false)
  const formSubmittedRef = useRef(false)
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  })

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  useEffect(() => {
    if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && error) {
      toast.error(error)
      formSubmittedRef.current = false
    }

    prevIsLoadingRef.current = isLoading
  }, [isLoading, error])

  const onSubmit = async (values: OtpFormValues) => {
    formSubmittedRef.current = true
    await onVerify(values.otp)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-foreground/60">Enter the 6-digit OTP sent to</p>
        <p className="font-medium text-foreground">{email}</p>
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

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg"
            disabled={isLoading || form.watch("otp").length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      </Form>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full border-white/20 text-foreground hover:bg-white/10 bg-transparent h-11"
          disabled={resendTimer > 0}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </Button>
        {onBack && (
          <Button
            variant="ghost"
            className="w-full text-foreground hover:bg-white/10 h-11"
            onClick={onBack}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  )
}
