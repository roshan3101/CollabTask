import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  authService,
  type SignupRequest,
  type LoginRequest,
  type OtpVerifyRequest,
  type ForgotPasswordRequest,
  type ForgetPasswordverifyRequest,
  type LoginInitiateResponse
} from "@/services/auth.service"
import { storageUtils } from "@/lib/storage"

export interface User {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface AuthenticatedUser {
    id: string
    firstName: string
    lastName: string
    email: string
}

export interface AuthState {
  user: AuthenticatedUser | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  otpStep: "email" | "otp" | null
  otpEmail: string | null
  forgotPasswordEmail: string | null
}


const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  otpStep: null,
  otpEmail: null,
  forgotPasswordEmail: null,
}

export const signupUser = createAsyncThunk("auth/signup", async (payload: SignupRequest, { rejectWithValue }) => {
  try {
    const response = await authService.signup(payload)
    if (!response.success) {
      return rejectWithValue(response.error || response.message)
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Signup failed")
  }
})

export const verifySignupOtp = createAsyncThunk("auth/verifySignupOtp", async (payload: OtpVerifyRequest, { rejectWithValue }) => {
  try{
    const response = await authService.verifySignupOtp(payload)
    if(!response.success) {
      return rejectWithValue(response.error || response.message)
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Otp Verification failed")
  }
})

export const loginUser = createAsyncThunk("auth/login", async (payload: LoginRequest, { rejectWithValue }) => {
  try {
    const response = await authService.login(payload)
    if(!response.success) {
      return rejectWithValue(response.error || response.message)
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Otp Verification failed")
  }
})

export const verifyLoginOtp = createAsyncThunk("auth/verifyLoginOtp", async (payload: OtpVerifyRequest, { rejectWithValue }) => {
  try{
    const response = await authService.verifyLoginOtp(payload)
    if(!response.success) {
      return rejectWithValue(response.error || response.message)
    }

    return response.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Otp Verification failed")
  }
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (payload: ForgotPasswordRequest, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(payload)
    if (!response.success) {
      return rejectWithValue(response.error || response.message)
    }
    return payload.email
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Forgot password request failed")
  }
})

export const resetPassword = createAsyncThunk("auth/resetPassword", async (payload: ForgetPasswordverifyRequest, { rejectWithValue }) => {
  try {
    const response = await authService.forgetPasswordVerify(payload)
    if (!response.success) {
      return rejectWithValue(response.error || response.message)
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Password reset failed")
  }
})

export const logout = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.logout()
    if (!response.success) {
      return rejectWithValue(response.error || response.message)
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Logout failed")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetOtpFlow: (state) => {
      state.otpStep = null
      state.otpEmail = null
    },
    resetForgotPasswordFlow: (state) => {
      state.forgotPasswordEmail = null
    }
  },
  extraReducers: (builder) => {

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.otpStep = "otp"
      state.otpEmail = action.payload?.email || null
    })
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Verify Signup OTP
    builder.addCase(verifySignupOtp.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(verifySignupOtp.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = action.payload?.user || null
      state.accessToken = action.payload?.accessToken || null
      state.refreshToken = action.payload?.refreshToken || null
      state.otpStep = null
      state.otpEmail = null

      if (action.payload?.accessToken) {
        storageUtils.setAccessToken(action.payload.accessToken)
      }
      if (action.payload?.refreshToken) {
        storageUtils.setRefreshToken(action.payload.refreshToken)
      }
      if (action.payload?.user) {
        storageUtils.setUser(action.payload.user)
      }
    })
    builder.addCase(verifySignupOtp.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.otpStep = "otp"
      state.otpEmail = action.payload?.email || null
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // login verify
    builder.addCase(verifyLoginOtp.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(verifyLoginOtp.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = action.payload?.user || null
      state.accessToken = action.payload?.accessToken || null
      state.refreshToken = action.payload?.refreshToken || null
      state.otpStep = null
      state.otpEmail = null
      
      if (action.payload?.accessToken) {
        storageUtils.setAccessToken(action.payload.accessToken)
      }
      if (action.payload?.refreshToken) {
        storageUtils.setRefreshToken(action.payload.refreshToken)
      }
      if (action.payload?.user) {
        storageUtils.setUser(action.payload.user)
      }
    })
    builder.addCase(verifyLoginOtp.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
    
    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.isLoading = false
      state.forgotPasswordEmail = action.payload
      state.otpStep = "otp"
    })
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
    
    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false
      state.forgotPasswordEmail = null
      state.otpStep = null
    })
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    builder.addCase(logout.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(logout.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.otpStep = null
      state.otpEmail = null
      
      // Clear localStorage
      storageUtils.clearAuth()
    })
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

export const { clearError, resetOtpFlow, resetForgotPasswordFlow } = authSlice.actions

// Handle restoration from storage
export default function authReducer(state = initialState, action: any) {
  if (action.type === "auth/restoreFromStorage") {
    return action.payload
  }
  return authSlice.reducer(state, action)
}
