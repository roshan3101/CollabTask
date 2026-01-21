import { apiClient } from "./apiClient"
import type { CreateTaskInput, UpdateTaskInput, Task, PaginatedTasksResponse } from "@/types/task"
import type { CommonResponse } from "@/types/common"

class TaskService {
  async listTasks(
    orgId: string,
    projectId: string,
    params?: {
      page?: number
      page_size?: number
      status?: string
      assignee_id?: string
      sort_by?: string
      sort_order?: string
    }
  ): Promise<CommonResponse<PaginatedTasksResponse>> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString())
      if (params?.status) queryParams.append("status", params.status)
      if (params?.assignee_id) queryParams.append("assignee_id", params.assignee_id)
      if (params?.sort_by) queryParams.append("sort_by", params.sort_by)
      if (params?.sort_order) queryParams.append("sort_order", params.sort_order)

      const queryString = queryParams.toString()
      const url = `/organizations/${orgId}/projects/${projectId}/tasks${queryString ? `?${queryString}` : ""}`

      const data = await apiClient.get<CommonResponse<PaginatedTasksResponse>>(url)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getTask(orgId: string, projectId: string, taskId: string): Promise<CommonResponse<Task>> {
    try {
      const data = await apiClient.get<CommonResponse<Task>>(
        `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load task",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async createTask(
    orgId: string,
    projectId: string,
    payload: CreateTaskInput
  ): Promise<CommonResponse<Task>> {
    try {
      const data = await apiClient.post<CommonResponse<Task>>(
        `/organizations/${orgId}/projects/${projectId}/tasks`,
        payload
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to create task",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async updateTask(
    orgId: string,
    projectId: string,
    taskId: string,
    payload: UpdateTaskInput
  ): Promise<CommonResponse<Task>> {
    try {
      const data = await apiClient.put<CommonResponse<Task>>(
        `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`,
        payload
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to update task",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async changeTaskStatus(
    orgId: string,
    projectId: string,
    taskId: string,
    status: string,
    version: number
  ): Promise<CommonResponse<Task>> {
    try {
      const data = await apiClient.put<CommonResponse<Task>>(
        `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/status`,
        { status, version }
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to change task status",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async assignTask(
    orgId: string,
    projectId: string,
    taskId: string,
    assigneeIds: string[],
    version: number
  ): Promise<CommonResponse<Task>> {
    try {
      const data = await apiClient.put<CommonResponse<Task>>(
        `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/assign`,
        { assignee_ids: assigneeIds, version }
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to assign task",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const taskService = new TaskService()
