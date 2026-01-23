export type TaskStatus = "todo" | "in_progress" | "review" | "done"

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  assignee_ids?: string[]
  assignee_names?: string[]
  project_id: string
  org_id?: string | null
  version: number
  created_by_id?: string | null
  created_by_name?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  assignee_ids?: string[]
}

export interface UpdateTaskInput {
  title?: string | null
  description?: string | null
  status?: TaskStatus | null
  assignee_ids?: string[] | null
  version: number
}

export interface PaginatedTasksResponse {
  items: Task[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
