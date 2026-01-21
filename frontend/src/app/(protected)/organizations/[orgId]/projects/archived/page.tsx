"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchArchivedProjects, restoreProject, fetchProjects } from "@/stores/slices/project.slice"
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
import { DeleteModal } from "@/components/ui/delete-modal"
import { Archive, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { ArchivedProjectsList } from "./components/archived-projects-list"

export default function ArchivedProjectsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string

  const { archivedProjects, isLoading, error } = useAppSelector((state) => state.projects)
  const { activeOrganization } = useAppSelector((state) => state.organizations)

  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [projectToRestore, setProjectToRestore] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (orgId) {
      dispatch(fetchArchivedProjects(orgId))
      dispatch(fetchOrganizationDetail(orgId))
    }
  }, [dispatch, orgId])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleRestoreClick = (projectId: string, projectName: string) => {
    setProjectToRestore({ id: projectId, name: projectName })
    setRestoreModalOpen(true)
  }

  const handleRestore = async () => {
    if (!projectToRestore) return

    try {
      await dispatch(restoreProject({ orgId, projectId: projectToRestore.id })).unwrap()
      toast.success("Project restored successfully")
      setRestoreModalOpen(false)
      setProjectToRestore(null)
      // Refresh the archived projects list
      dispatch(fetchArchivedProjects(orgId))
      // Also refresh the regular projects list
      dispatch(fetchProjects(orgId))
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to restore project"
      toast.error(message)
    }
  }

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
            <BreadcrumbLink href={`/organizations/${orgId}/projects`}>
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Archived</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Archive className="w-6 h-6" />
            Archived Projects
          </h1>
          <p className="text-muted-foreground text-sm">
            View and restore archived projects
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/organizations/${orgId}/projects`)}>
          Back to Projects
        </Button>
      </div>

      <ArchivedProjectsList
        projects={archivedProjects}
        isLoading={isLoading}
        orgId={orgId}
        onRestore={handleRestoreClick}
      />

      {projectToRestore && (
        <DeleteModal
          open={restoreModalOpen}
          placeholder={`restore "${projectToRestore.name}"`}
          onConfirm={handleRestore}
          onCancel={() => {
            setRestoreModalOpen(false)
            setProjectToRestore(null)
          }}
        />
      )}
    </div>
  )
}
