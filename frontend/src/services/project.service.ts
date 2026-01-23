import { CreateProjectInput, Project, UpdateProjectInput } from "@/types/project";
import { apiClient } from "./apiClient"
import { CommonResponse } from "@/types/common";


export class ProjectService {
    async createProject(orgId: string, payload: CreateProjectInput) : Promise<CommonResponse<Project>> {
        try {
            const data = await apiClient.post<CommonResponse<Project>>(`/organizations/${orgId}/projects`, payload)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to create project",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async listProjects(orgId: string) : Promise<CommonResponse<Project[]>> {
        try{
            const data = await apiClient.get<CommonResponse<Project[]>>(`/organizations/${orgId}/projects`)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to list projects",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async listArchivedProjects(orgId: string) : Promise<CommonResponse<Project[]>> {
        try{
            const data = await apiClient.get<CommonResponse<Project[]>>(`/organizations/${orgId}/projects/archived`)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to list archived projects",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async getProject(orgId: string, projectId: string) : Promise<CommonResponse<Project>> {
        try{
            const data = await apiClient.get<CommonResponse<Project>>(`/organizations/${orgId}/projects/${projectId}`)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to get project",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async updateProject(orgId: string, projectId: string, payload: UpdateProjectInput) : Promise<CommonResponse<Project>> {
        try{
            const data = await apiClient.put<CommonResponse<Project>>(`/organizations/${orgId}/projects/${projectId}`, payload)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to update project",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async deleteProject(orgId: string, projectId: string) : Promise<CommonResponse<null>> {
        try{
            const data = await apiClient.delete<CommonResponse<null>>(`/organizations/${orgId}/projects/${projectId}`)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to delete project",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async restoreProject(orgId: string, projectId: string) : Promise<CommonResponse<Project>> {
        try{
            const data = await apiClient.post<CommonResponse<Project>>(`/organizations/${orgId}/projects/${projectId}/restore`)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to restore project",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    async getProjectAnalytics(orgId: string, projectId: string): Promise<CommonResponse<{
        total_tasks: number
        active_tasks: number
        completed_tasks: number
        team_members: number
    }>> {
        try {
            const data = await apiClient.get<CommonResponse<{
                total_tasks: number
                active_tasks: number
                completed_tasks: number
                team_members: number
            }>>(`/organizations/${orgId}/projects/${projectId}/analytics`)
            return data
        } catch (error) {
            return {
                success: false,
                message: "Failed to load project analytics",
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }
}

export const projectService = new ProjectService()