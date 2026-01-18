"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

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
    }
    else if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && !error) {
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
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter new password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Confirm new password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
