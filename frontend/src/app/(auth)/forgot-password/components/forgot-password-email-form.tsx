"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type EmailFormValues = z.infer<typeof emailSchema>

interface ForgotPasswordEmailFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function ForgotPasswordEmailForm({ onSubmit, isLoading, error }: ForgotPasswordEmailFormProps) {
  const prevIsLoadingRef = useRef(false)
  const formSubmittedRef = useRef(false)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  useEffect(() => {
    if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && error) {
      toast.error(error)
      formSubmittedRef.current = false
    }
    else if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && !error) {
      toast.success("OTP sent to your email")
      formSubmittedRef.current = false
    }
    prevIsLoadingRef.current = isLoading
  }, [isLoading, error])

  const handleSubmit = async (values: EmailFormValues) => {
    formSubmittedRef.current = true
    await onSubmit(values.email)
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        We'll send an OTP to your email to verify your identity.
      </p>
    </div>
  )
}
