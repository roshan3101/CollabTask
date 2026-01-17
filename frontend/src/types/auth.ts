import * as z from "zod"

export const signupSchema = z
  .object({
    firstName: z.string().min(2, "FirstName must be at least 2 characters"),
    lastName: z.string().min(2,"LastName should be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
})