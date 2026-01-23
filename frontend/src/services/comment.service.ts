import { apiClient } from "@/services/apiClient"
import type { CommonResponse } from "@/types/common"
import type { Comment } from "@/types/comment"

class CommentService {
  async listComments(
    orgId: string,
    projectId: string,
  ): Promise<CommonResponse<Comment[]>> {
    return apiClient.get<CommonResponse<Comment[]>>(
      `/organizations/${orgId}/projects/${projectId}/comments`,
    )
  }

  async createComment(
    orgId: string,
    projectId: string,
    content: string,
  ): Promise<CommonResponse<Comment>> {
    return apiClient.post<CommonResponse<Comment>>(
      `/organizations/${orgId}/projects/${projectId}/comments`,
      { content },
    )
  }

  async updateComment(
    orgId: string,
    projectId: string,
    commentId: string,
    content: string,
  ): Promise<CommonResponse<Comment>> {
    return apiClient.put<CommonResponse<Comment>>(
      `/organizations/${orgId}/projects/${projectId}/comments/${commentId}`,
      { content },
    )
  }

  async deleteComment(
    orgId: string,
    projectId: string,
    commentId: string,
  ): Promise<CommonResponse<null>> {
    return apiClient.delete<CommonResponse<null>>(
      `/organizations/${orgId}/projects/${projectId}/comments/${commentId}`,
    )
  }
}

export const commentService = new CommentService()

