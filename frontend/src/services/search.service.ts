import { apiClient } from "./apiClient"
import type { CommonResponse } from "@/types/common"

export interface SearchResult {
  tasks: Array<{
    id: string
    title: string
    status: string
    project_id: string
    project_name: string | null
    org_id: string | null
    org_name: string | null
  }>
  projects: Array<{
    id: string
    name: string
    description: string | null
    org_id: string
    org_name: string | null
  }>
  organizations: Array<{
    id: string
    name: string
    description: string | null
  }>
}

class SearchService {
  async search(
    query: string,
    types?: ("task" | "project" | "organization")[]
  ): Promise<CommonResponse<SearchResult>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("q", query)
      if (types && types.length > 0) {
        queryParams.append("types", types.join(","))
      }

      const data = await apiClient.get<CommonResponse<SearchResult>>(
        `/search?${queryParams.toString()}`
      )
      return data
    } catch (error) {
      return {
        success: false,
        message: "Failed to perform search",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const searchService = new SearchService()
