import { apiClient } from "@/services/apiClient"
import type { CommonResponse } from "@/types/common"
import type { Meeting } from "@/types/meeting"

class MeetingService {
  async createMeeting(
    orgId: string,
    payload: {
      title: string
      description?: string
      google_meet_link: string
      start_time: string
      end_time: string
      participant_ids: string[]
    },
  ): Promise<CommonResponse<{ id: string }>> {
    return apiClient.post<CommonResponse<{ id: string }>>(
      `/meetings/organizations/${orgId}`,
      payload,
    )
  }

  async listMyMeetings(params?: {
    from_time?: string
    to_time?: string
  }): Promise<CommonResponse<Meeting[]>> {
    const search = new URLSearchParams()
    if (params?.from_time) search.set("from_time", params.from_time)
    if (params?.to_time) search.set("to_time", params.to_time)
    const qs = search.toString()
    const url = qs ? `/meetings/my?${qs}` : "/meetings/my"
    return apiClient.get<CommonResponse<Meeting[]>>(url)
  }
}

export const meetingService = new MeetingService()

