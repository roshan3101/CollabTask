import { apiClient } from "./apiClient"

export interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface SignupResponse {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface OtpVerifyRequest {
  email: string,
  otp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginInitiateResponse {
  email: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string,
    firstName: string,
    lastName: string,
    email: string
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgetPasswordverifyRequest {
  email: string
  otp: string
  new_password: string
}

export interface AuthResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

class AuthService {

  async signup(payload: SignupRequest): Promise<AuthResponse<SignupResponse>> {
    try {
      const data = await apiClient.post<AuthResponse<SignupResponse>>(
        '/auth/signup',
        payload
      )

      return data

    } catch (error) {
      return {
        success: false,
        message: "Signup failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async verifySignupOtp(payload: OtpVerifyRequest): Promise<AuthResponse<LoginResponse>> {
    try{
      const data = await apiClient.post<AuthResponse<LoginResponse>>(
        '/auth/otp/verify',
        payload
      )

      return data
    } catch (error) {
      return {
        success: false,
        message: "Verification failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async login(payload: LoginRequest): Promise<AuthResponse<LoginInitiateResponse>> {
    try{
      const data = await apiClient.post<AuthResponse<LoginInitiateResponse>>(
        '/auth/login/initiate',
        payload
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async verifyLoginOtp(payload: OtpVerifyRequest): Promise<AuthResponse<LoginResponse>> {
    try {
      const data = await apiClient.post<AuthResponse<LoginResponse>>(
        '/auth/otp/verify',
        payload
      )

      return data
    } catch (error) {
      return {
        success: false,
        message: "OTP verification failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<AuthResponse<{ email: string }>> {
    try{
      const data = await apiClient.post<AuthResponse<{ email: string }>>(
        '/auth/forgot-password/initiate',
        payload
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Otp sending failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async forgetPasswordVerify(payload: ForgetPasswordverifyRequest): Promise<AuthResponse<{}>> {
    try{
      const data = await apiClient.post<AuthResponse<{}>>(
        '/auth/forgot-password/verify',
        payload
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Verification failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  async logout(token?: string): Promise<AuthResponse<{}>> {
    try{
      const data = await apiClient.post<AuthResponse<{}>>(
        '/auth/logout',
        undefined,
        token
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "logout failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}

export const authService = new AuthService()
