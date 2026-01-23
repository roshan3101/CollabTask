"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { ArrowRight, Mail, Lock } from "lucide-react"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const prevIsLoadingRef = useRef(false)
  const formSubmittedRef = useRef(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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

  const onSubmit = async (values: LoginFormValues) => {
    formSubmittedRef.current = true
    await onLogin(values.email, values.password)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-foreground">Email Address</FormLabel>
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

        {/* Password Input */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="block text-sm font-medium text-foreground">Password</FormLabel>
                <Link href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-400">
                  Forgot password?
                </Link>
              </div>
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

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg group mt-8"
        >
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>
    </Form>
  )
}
