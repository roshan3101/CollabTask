import { apiClient } from "./apiClient"
import type { CommonResponse } from "@/types/common"

export interface Activity {
  id: string
  entity_type: string
  entity_id: string
  action: string
  metadata: Record<string, any>
  user_id: string
  user_name: string
  entity_name: string
  project_name?: string | null
  created_at: string
}

export interface FilterOption {
  value: string
  label: string
}

export interface ActivitiesResponse {
  activities: Activity[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
  filter_options?: {
    entity_types: FilterOption[]
    action_types: FilterOption[]
  }
}

class ActivityService {
  async getOrganizationActivities(
    orgId: string,
    params?: {
      page?: number
      page_size?: number
      entity_type?: string
      action_type?: string
    }
  ): Promise<CommonResponse<ActivitiesResponse>> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString())
      if (params?.entity_type) queryParams.append("entity_type", params.entity_type)
      if (params?.action_type) queryParams.append("action_type", params.action_type)

      const queryString = queryParams.toString()
      const url = `/organizations/${orgId}/activities${queryString ? `?${queryString}` : ""}`

      const data = await apiClient.get<CommonResponse<ActivitiesResponse>>(url)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load activities",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const activityService = new ActivityService()
