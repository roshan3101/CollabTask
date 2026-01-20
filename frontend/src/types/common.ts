export interface CommonResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ProjectType {
    id: string
    name: string
    createdAt: string
}

export interface ListProjectType {
    id: string
    name: string
    projects: ProjectType[]
}
