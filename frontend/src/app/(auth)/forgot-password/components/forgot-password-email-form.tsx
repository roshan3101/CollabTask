"use client"

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
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  const handleSubmit = async (values: EmailFormValues) => {
    try {
      await onSubmit(values.email)
      toast.success("OTP sent to your email")
    } catch (err) {
      toast.error(error || "Failed to send OTP")
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

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
