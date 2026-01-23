import { apiClient } from "./apiClient"
import type { CommonResponse } from "@/types/common"
import type { AuthenticatedUser } from "@/stores/slices/auth.slice"

export interface UpdateUserProfileInput {
  firstName?: string
  lastName?: string
}

class UserService {
  async getCurrentUser(): Promise<CommonResponse<AuthenticatedUser>> {
    try {
      const data = await apiClient.get<CommonResponse<AuthenticatedUser>>("/users/me")
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async updateUserProfile(payload: UpdateUserProfileInput): Promise<CommonResponse<AuthenticatedUser>> {
    try {
      const data = await apiClient.put<CommonResponse<AuthenticatedUser>>("/users/me", payload)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to update user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const userService = new UserService()
