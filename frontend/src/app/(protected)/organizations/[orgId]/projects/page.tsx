"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchProjects } from "@/stores/slices/project.slice"
import { fetchOrganizationDetail } from "@/stores/slices/organization.slice"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus, Archive } from "lucide-react"
import { toast } from "sonner"
import { ProjectsList } from "./components/projects-list"

export default function ProjectsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string

  const { projects, isLoading, error } = useAppSelector((state) => state.projects)
  const { activeOrganization } = useAppSelector((state) => state.organizations)

  useEffect(() => {
    if (orgId) {
      dispatch(fetchProjects(orgId))
      dispatch(fetchOrganizationDetail(orgId))
    }
  }, [dispatch, orgId])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleCreateClick = () => {
    router.push(`/organizations/${orgId}/projects/new`)
  }

  const handleArchivedClick = () => {
    router.push(`/organizations/${orgId}/projects/archived`)
  }

  const isAdminOrOwner = activeOrganization?.role === "admin" || activeOrganization?.role === "owner"

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/organizations">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/organizations/${orgId}`}>
              {activeOrganization?.name || "Organization"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Manage your organization projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdminOrOwner && (
            <Button variant="outline" onClick={handleArchivedClick}>
              <Archive className="w-4 h-4 mr-2" />
              Archived Projects
            </Button>
          )}
          <Button onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <ProjectsList projects={projects} isLoading={isLoading} orgId={orgId} />
    </div>
  )
}
