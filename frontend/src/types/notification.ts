export type NotificationType = "org_invite"

export interface NotificationMetadata {
  org_id?: string
  org_name?: string
  inviter_name?: string
  membership_id?: string
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
