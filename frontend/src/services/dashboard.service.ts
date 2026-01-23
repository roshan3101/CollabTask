import { apiClient } from "./apiClient"
import type { CommonResponse } from "@/types/common"

export interface DashboardAnalytics {
  total_projects: number
  active_tasks: number
  complete_tasks: number
  team_members: number
}

export interface RecentProject {
  id: string
  name: string
  description: string
  org_id: string
  total_tasks: number
  completed_tasks: number
  updatedAt: string | null
  createdAt: string | null
}

class DashboardService {
  async getAnalytics(): Promise<CommonResponse<DashboardAnalytics>> {
    try {
      const data = await apiClient.get<CommonResponse<DashboardAnalytics>>(
        "/common/dashboard/analytics"
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load dashboard analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getRecentProjects(limit: number = 3): Promise<CommonResponse<RecentProject[]>> {
    try {
      const data = await apiClient.get<CommonResponse<RecentProject[]>>(
        `/common/dashboard/recent-projects?limit=${limit}`
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load recent projects",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const dashboardService = new DashboardService()
