import { apiClient } from "./apiClient"
import type { CommonResponse } from "@/types/common"
import type { NotificationListResponse } from "@/types/notification"

class NotificationService {
  async listNotifications(params?: {
    page?: number
    page_size?: number
    unread_only?: boolean
  }): Promise<CommonResponse<NotificationListResponse>> {
    try {
      const search = new URLSearchParams()
      if (params?.page != null) search.set("page", String(params.page))
      if (params?.page_size != null) search.set("page_size", String(params.page_size))
      if (params?.unread_only != null) search.set("unread_only", String(params.unread_only))
      const qs = search.toString()
      const url = qs ? `/notifications?${qs}` : "/notifications"
      const data = await apiClient.get<CommonResponse<NotificationListResponse>>(url)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load notifications",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async markRead(notificationId: string): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.patch<CommonResponse<null>>(
        `/notifications/${notificationId}/read`
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async markAllRead(): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.patch<CommonResponse<null>>("/notifications/read-all")
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to mark all as read",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const notificationService = new NotificationService()
