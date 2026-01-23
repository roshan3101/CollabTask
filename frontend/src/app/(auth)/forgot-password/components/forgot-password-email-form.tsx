"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Mail } from "lucide-react"

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type EmailFormValues = z.infer<typeof emailSchema>

interface ForgotPasswordEmailFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function ForgotPasswordEmailForm({
  onSubmit,
  isLoading,
  error,
}: ForgotPasswordEmailFormProps) {
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
    } else if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && !error) {
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
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-foreground">
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                    <Input
                      placeholder="you@example.com"
                      type="email"
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
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-foreground/60">
        We&apos;ll send an OTP to your email to verify your identity.
      </p>
    </div>
  )
}
