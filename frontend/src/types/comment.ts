export interface CommentUser {
  id: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

export interface Comment {
  id: string
  content: string
  createdAt: string | null
  user: CommentUser
}

