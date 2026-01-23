"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Lock } from "lucide-react"

const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetFormValues = z.infer<typeof resetSchema>

interface ForgotPasswordResetFormProps {
  email: string
  onResetPassword: (newPassword: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function ForgotPasswordResetForm({
  email,
  onResetPassword,
  isLoading,
  error,
}: ForgotPasswordResetFormProps) {
  const prevIsLoadingRef = useRef(false)
  const formSubmittedRef = useRef(false)

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && error) {
      toast.error(error)
      formSubmittedRef.current = false
    } else if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && !error) {
      toast.success("Password reset successfully")
      formSubmittedRef.current = false
    }
    prevIsLoadingRef.current = isLoading
  }, [isLoading, error])

  const onSubmit = async (values: ResetFormValues) => {
    formSubmittedRef.current = true
    await onResetPassword(values.newPassword)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* New password */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-foreground">
                New Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <Input
                    placeholder="••••••••"
                    type="password"
                    {...field}
                    className="pl-10 bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40 focus:bg-white/15 focus:border-white/30 h-11"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-foreground">
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <Input
                    placeholder="••••••••"
                    type="password"
                    {...field}
                    className="pl-10 bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40 focus:bg-white/15 focus:border-white/30 h-11"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  )
}
