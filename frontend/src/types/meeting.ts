export interface MeetingUser {
  id: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

export interface Meeting {
  id: string
  org_id: string
  org_name?: string | null
  title: string
  description?: string | null
  google_meet_link: string
  start_time: string
  end_time: string
  created_by: MeetingUser
  participant_ids: string[]
}

