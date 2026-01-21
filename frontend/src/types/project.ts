import { User } from "@/stores/slices/auth.slice"
import { Organization } from "./organization"

export interface Project {
    id: string
    name: string
    description: string | null
    organization: Organization | null
    createdBy: User | null
    is_archieved: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateProjectInput {
    name: string
    description: string | null
}

export interface UpdateProjectInput {
    name: string | null
    description: string | null
    is_archieved: boolean | null
}