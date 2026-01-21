"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchProjectDetail, updateProject, deleteProject, fetchProjects } from "@/stores/slices/project.slice"
import { fetchOrganizationDetail } from "@/stores/slices/organization.slice"
import { fetchTasks, createTask } from "@/stores/slices/task.slice"
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
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { ProjectActions } from "./components/project-actions"
import { KanbanBoard } from "./components/kanban-board"
import { TaskListView } from "./components/task-list-view"
import { ProjectSettings } from "./components/project-settings"
import type { ViewType } from "./components/project-actions"
import type { CreateTaskInput, Task, TaskStatus } from "@/types/task"
import { changeTaskStatus } from "@/stores/slices/task.slice"

export default function ProjectDetailPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string
  const projectId = params.projectId as string

  const { activeProject, isLoading, error } = useAppSelector((state) => state.projects)
  const { activeOrganization } = useAppSelector((state) => state.organizations)
  const { tasks, isLoading: tasksLoading } = useAppSelector((state) => state.tasks)

  const [view, setView] = useState<ViewType>("kanban")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (orgId && projectId) {
      dispatch(fetchProjectDetail({ orgId, projectId }))
      dispatch(fetchOrganizationDetail(orgId))
      dispatch(fetchTasks({ orgId, projectId, params: { page_size: 100 } }))
    }
  }, [dispatch, orgId, projectId])

  useEffect(() => {
    if (activeProject) {
      setFormData({
        name: activeProject.name || "",
        description: activeProject.description || "",
      })
    }
  }, [activeProject])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSave = async () => {
    if (!activeProject) return

    if (!formData.name || formData.name.trim().length < 3) {
      toast.error("Project name must be at least 3 characters")
      return
    }

    setIsSaving(true)
    try {
      await dispatch(
        updateProject({
          orgId,
          projectId: activeProject.id,
          payload: {
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            is_archieved: false,
          },
        })
      ).unwrap()
      toast.success("Project updated successfully")
      setIsEditing(false)
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to update project"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (activeProject) {
      setFormData({
        name: activeProject.name || "",
        description: activeProject.description || "",
      })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!activeProject) return

    try {
      await dispatch(deleteProject({ orgId, projectId: activeProject.id })).unwrap()
      toast.success("Project archived successfully")
      setIsDeleteModalOpen(false)
      // Refresh projects list
      dispatch(fetchProjects(orgId))
      router.push(`/organizations/${orgId}/projects`)
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to archive project"
      toast.error(message)
    }
  }

  const handleCreateTask = async (data: CreateTaskInput) => {
    if (!activeProject) return

    try {
      await dispatch(createTask({ orgId, projectId: activeProject.id, payload: data })).unwrap()
      toast.success("Task created successfully")
      // Refresh tasks list
      dispatch(fetchTasks({ orgId, projectId: activeProject.id, params: { page_size: 100 } }))
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to create task"
      toast.error(message)
      throw err
    }
  }

  const handleTaskClick = (task: Task) => {
    router.push(`/organizations/${orgId}/projects/${projectId}/tasks/${task.id}`)
  }

  if (isLoading && !activeProject) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading project...</div>
    )
  }

  if (!activeProject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Button variant="outline" onClick={() => router.push(`/organizations/${orgId}/projects`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    )
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
            <BreadcrumbPage>{activeProject.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Project Name and Description Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{activeProject.name}</h1>
          {activeProject.description && (
            <p className="text-muted-foreground">{activeProject.description}</p>
          )}
        </div>
        <ProjectActions
          view={view}
          onViewChange={setView}
          onNewTask={() => router.push(`/organizations/${orgId}/projects/${projectId}/new`)}
        />
      </div>

      {/* View Content */}
      {view === "kanban" && (
        <div>
          {tasksLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onAddTaskClick={() =>
                router.push(`/organizations/${orgId}/projects/${projectId}/new`)
              }
              onStatusChange={async (task: Task, newStatus: TaskStatus) => {
                try {
                  await dispatch(
                    changeTaskStatus({
                      orgId,
                      projectId,
                      taskId: task.id,
                      status: newStatus,
                      version: task.version,
                    })
                  ).unwrap()
                  dispatch(fetchTasks({ orgId, projectId, params: { page_size: 100 } }))
                } catch (err) {
                  const message =
                    typeof err === "string" ? err : "Failed to update task status"
                  toast.error(message)
                }
              }}
            />
          )}
        </div>
      )}

      {view === "list" && (
        <TaskListView
          tasks={tasks}
          isLoading={tasksLoading}
          onTaskClick={handleTaskClick}
          onAddTaskClick={() =>
            router.push(`/organizations/${orgId}/projects/${projectId}/new`)
          }
        />
      )}

      {view === "settings" && activeProject && (
        <ProjectSettings
          project={activeProject}
          formData={formData}
          onFormDataChange={setFormData}
          onSave={handleSave}
          onArchive={() => setIsDeleteModalOpen(true)}
          isSaving={isSaving}
        />
      )}

      <DeleteModal
        open={isDeleteModalOpen}
        placeholder={`archive "${activeProject.name}"`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
