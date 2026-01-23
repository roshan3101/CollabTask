export type NotificationType = "org_invite" | "meeting" | "chat"

export interface NotificationMetadata {
  org_id?: string
  org_name?: string
  inviter_name?: string
  membership_id?: string
  meeting_id?: string
  title?: string
  start_time?: string
  end_time?: string
  google_meet_link?: string
  created_by_name?: string
  project_id?: string
  project_name?: string
  sender_id?: string
  sender_name?: string
  message_preview?: string
  invite_status?: "accepted" | "rejected"
}

export interface Notification {
  id: string
  type: NotificationType | string
  title: string
  message: string
  metadata: NotificationMetadata
  read: boolean
  created_at: string | null
}

export interface NotificationPagination {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface NotificationListResponse {
  notifications: Notification[]
  pagination: NotificationPagination
}
