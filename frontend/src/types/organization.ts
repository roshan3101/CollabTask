export type OrganizationVisibility = "public" | "private"

export interface Organization {
  id: string
  name: string
  address?: string | null
  website?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
  role?: string
}

export interface OrganizationMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "member" | "admin" | "owner" | string
}

export interface CreateOrganizationInput {
  name: string
  description?: string
  address?: string
  website?: string
  logoUrl?: string
}

export interface InviteMemberInput {
  email: string
  role: "member" | "admin"
}

