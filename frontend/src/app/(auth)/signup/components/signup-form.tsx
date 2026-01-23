"use client"

import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { ArrowRight, Mail, Lock, User } from "lucide-react"
import { signupSchema } from "@/types/auth"

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSignup: (data: SignupFormValues) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function SignupForm({ onSignup, isLoading, error }: SignupFormProps) {
  const prevIsLoadingRef = useRef(false)
  const formSubmittedRef = useRef(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && error) {
      toast.error(error)
      formSubmittedRef.current = false
    } else if (formSubmittedRef.current && !isLoading && prevIsLoadingRef.current && !error) {
      toast.success("Account created successfully. Please check your email for verification.")
      formSubmittedRef.current = false
    }
    prevIsLoadingRef.current = isLoading
  }, [isLoading, error])

  const onSubmit = async (values: SignupFormValues) => {
    formSubmittedRef.current = true
    await onSignup(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name Input */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-foreground">First Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    className="pl-10 bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40 focus:bg-white/15 focus:border-white/30 h-11"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name Input */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-foreground">Last Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    className="pl-10 bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40 focus:bg-white/15 focus:border-white/30 h-11"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel className="block text-sm font-medium text-foreground">Password</FormLabel>
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

        {/* Confirm Password Input */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-foreground">Confirm Password</FormLabel>
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

        {/* Sign Up Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg group mt-8"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>
    </Form>
  )
}
