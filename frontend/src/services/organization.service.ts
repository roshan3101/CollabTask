import { apiClient } from "./apiClient"
import type { CreateOrganizationInput, Organization, OrganizationMember, InviteMemberInput } from "@/types/organization"
import type { CommonResponse } from "@/types/common"

class OrganizationService {
  async listOrganizations(): Promise<CommonResponse<Organization[]>> {
    try {
      const data = await apiClient.get<CommonResponse<Organization[]>>("/organizations")
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load organizations",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async createOrganization(input: CreateOrganizationInput): Promise<CommonResponse<Organization>> {
    const payload = {
      name: input.name,
      description: input.description?.trim() || null,
      address: input.address?.trim() || null,
      website: input.website?.trim() || null,
    }

    try {
      const data = await apiClient.post<CommonResponse<Organization>>("/organizations", payload)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to create organization",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getOrganization(orgId: string): Promise<CommonResponse<Organization>> {
    try {
      const data = await apiClient.get<CommonResponse<Organization>>(`/organizations/${orgId}`)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load organization",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getOrganizationMembers(orgId: string): Promise<CommonResponse<OrganizationMember[]>> {
    try {
      const data = await apiClient.get<CommonResponse<OrganizationMember[]>>(
        `/organizations/${orgId}/members`
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load members",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async updateOrganization(
    orgId: string,
    input: Partial<CreateOrganizationInput>
  ): Promise<CommonResponse<Organization>> {
    const payload = {
      name: input.name,
      description: input.description?.trim() || null,
      address: input.address?.trim() || null,
      website: input.website?.trim() || null,
    }

    try {
      const data = await apiClient.put<CommonResponse<Organization>>(
        `/organizations/${orgId}`,
        payload
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to update organization",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async deleteOrganization(orgId: string): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.delete<CommonResponse<null>>(`/organizations/${orgId}`)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to delete organization",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async addMember(orgId: string, input: InviteMemberInput): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.post<CommonResponse<null>>(`/organizations/${orgId}/members`, {
        email: input.email,
        role: input.role,
      })
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to add member",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async removeMember(orgId: string, userId: string): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.delete<CommonResponse<null>>(
        `/organizations/${orgId}/members/${userId}`
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to remove member",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async changeMemberRole(
    orgId: string,
    userId: string,
    role: "member" | "admin" | "owner"
  ): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.put<CommonResponse<null>>(
        `/organizations/${orgId}/members/${userId}/role`,
        { role }
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to change member role",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async leaveOrganization(orgId: string): Promise<CommonResponse<null>> {
    try {
      const data = await apiClient.delete<CommonResponse<null>>(`/organizations/${orgId}/leave`)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to leave organization",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getOrganizationAnalytics(orgId: string): Promise<CommonResponse<{
    total_projects: number
    total_members: number
    total_tasks: number
    active_tasks: number
    completed_tasks: number
  }>> {
    try {
      const data = await apiClient.get<CommonResponse<{
        total_projects: number
        total_members: number
        total_tasks: number
        active_tasks: number
        completed_tasks: number
      }>>(`/organizations/${orgId}/analytics`)
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to load organization analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const organizationService = new OrganizationService()

