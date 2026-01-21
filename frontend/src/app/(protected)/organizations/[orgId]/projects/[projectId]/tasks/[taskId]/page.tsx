"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchTaskDetail, updateTask } from "@/stores/slices/task.slice"
import { fetchProjectDetail } from "@/stores/slices/project.slice"
import { fetchOrganizationDetail } from "@/stores/slices/organization.slice"
import { organizationService } from "@/services/organization.service"
import type { OrganizationMember } from "@/types/organization"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DeleteModal } from "@/components/ui/delete-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { ArrowLeft, Save, Trash2, Calendar, User, FileText, Search, UserPlus2 } from "lucide-react"
import type { TaskStatus } from "@/types/task"

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-800" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "review", label: "In Review", color: "bg-yellow-100 text-yellow-800" },
  { value: "done", label: "Done", color: "bg-green-100 text-green-800" },
]

export default function TaskDetailPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string
  const projectId = params.projectId as string
  const taskId = params.taskId as string

  const { activeTask, isLoading, error } = useAppSelector((state) => state.tasks)
  const { activeProject } = useAppSelector((state) => state.projects)
  const { activeOrganization } = useAppSelector((state) => state.organizations)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [formData, setFormData] = useState<{
    title: string
    description: string
    status: TaskStatus
    assignee_ids: string[]
  }>({
    title: "",
    description: "",
    status: "todo",
    assignee_ids: [],
  })

  useEffect(() => {
    if (orgId && projectId && taskId) {
      dispatch(fetchTaskDetail({ orgId, projectId, taskId }))
      dispatch(fetchProjectDetail({ orgId, projectId }))
      dispatch(fetchOrganizationDetail(orgId))

      // Fetch organization members for assignee selection
      organizationService
        .getOrganizationMembers(orgId)
        .then((response) => {
          if (response.success && response.data) {
            setMembers(response.data)
          }
        })
        .catch(() => {
          // Silent fail for members
        })
    }
  }, [dispatch, orgId, projectId, taskId])

  useEffect(() => {
    if (activeTask) {
      setFormData({
        title: activeTask.title || "",
        description: activeTask.description || "",
        status: activeTask.status || "todo",
        assignee_ids: activeTask.assignee_ids || [],
      })
    }
  }, [activeTask])

  useEffect(() => {
    if (error) {
      toast.error(error as string)
    }
  }, [error])

  const handleSave = async () => {
    if (!activeTask) return

    if (!formData.title || formData.title.trim().length < 3) {
      toast.error("Task title must be at least 3 characters")
      return
    }

    setIsSaving(true)
    try {
      await dispatch(
        updateTask({
          orgId,
          projectId,
          taskId: activeTask.id,
          payload: {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            status: formData.status,
            assignee_ids: formData.assignee_ids.length > 0 ? formData.assignee_ids : [],
            version: activeTask.version,
          },
        })
      ).unwrap()
      toast.success("Task updated successfully")
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to update task"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    // TODO: Implement delete functionality when backend endpoint is available
    toast.info("Delete functionality coming soon")
    setIsDeleteModalOpen(false)
  }

  const getStatusColor = (status: TaskStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.color || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: TaskStatus) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status
  }

  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const selectedMembers = members.filter((m) => formData.assignee_ids.includes(m.id))
  const filteredMembers = members.filter((member) => {
    const query = assigneeFilter.toLowerCase()
    if (!query) return true
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
    return fullName.includes(query)
  })

  if (isLoading && !activeTask) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!activeTask) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Task not found</p>
        <Button variant="outline" onClick={() => router.push(`/organizations/${orgId}/projects/${projectId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            <BreadcrumbLink href={`/organizations/${orgId}/projects`}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/organizations/${orgId}/projects/${projectId}`}>
              {activeProject?.name || "Project"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Task</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/organizations/${orgId}/projects/${projectId}`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Type pill + meta + assignees */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center rounded-full border px-3 py-1 bg-background/40">
            <span className="h-2 w-2 rounded-full bg-primary mr-2" />
            Task
          </span>
          {activeProject?.name && (
            <span className="hidden sm:inline-flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              {activeProject.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedMembers.length > 0 && (
            <div className="flex -space-x-2">
              {selectedMembers.slice(0, 3).map((member) => {
                const initials = getAvatarInitials(`${member.firstName} ${member.lastName}`)
                return (
                  <Avatar
                    key={member.id}
                    className="h-7 w-7 border border-border bg-muted text-[10px] font-medium uppercase"
                  >
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                )
              })}
              {selectedMembers.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium border border-border">
                  +{selectedMembers.length - 3}
                </div>
              )}
            </div>
          )}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <UserPlus2 className="w-3 h-3" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign to</DialogTitle>
                <DialogDescription>Select one or more members for this task.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Find users"
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="pl-8"
                  />
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-1">No users found</p>
                  ) : (
                    filteredMembers.map((member) => {
                      const initials = getAvatarInitials(`${member.firstName} ${member.lastName}`)
                      const checked = formData.assignee_ids.includes(member.id)
                      return (
                        <label
                          key={member.id}
                          className="flex items-center gap-3 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  assignee_ids: [...prev.assignee_ids, member.id],
                                }))
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  assignee_ids: prev.assignee_ids.filter((id) => id !== member.id),
                                }))
                              }
                            }}
                            className="h-3 w-3 rounded border-muted-foreground"
                          />
                          <Avatar className="h-7 w-7 border border-border bg-muted text-[10px] font-medium uppercase">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {member.firstName} {member.lastName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{member.email}</span>
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAssignOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsAssignOpen(false)
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Input
          id="task-title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className="text-2xl md:text-3xl font-semibold bg-transparent border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:border-b"
          placeholder="Task title"
        />
      </div>

      {/* Properties row (status, dates, assignees, etc.) */}
      <div className="rounded-xl border bg-background/40 px-4 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {/* Status */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">
              <FileText className="w-4 h-4" />
            </span>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
              <select
                className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as TaskStatus,
                  }))
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
            </span>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Dates</p>
              <p className="text-xs text-muted-foreground">
                {new Date(activeTask.createdAt).toLocaleDateString()} &rarr;{" "}
                {new Date(activeTask.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Assignees */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">
              <User className="w-4 h-4" />
            </span>
            <div className="space-y-1 w-full">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Assignees</p>
              {activeTask.assignee_names && activeTask.assignee_names.length > 0 ? (
                <p className="text-xs">
                  {activeTask.assignee_names.join(", ")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Empty</p>
              )}
            </div>
          </div>

          {/* Time estimate (placeholder) */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">
              {/* simple hourglass icon using unicode */}
              <span className="text-xs">⏱</span>
            </span>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Time estimate</p>
              <p className="text-xs text-muted-foreground">Not set</p>
            </div>
          </div>

          {/* Priority (placeholder) */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">
              <span className="text-xs">⚑</span>
            </span>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Priority</p>
              <p className="text-xs text-muted-foreground">Empty</p>
            </div>
          </div>

        </div>
      </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </p>
          <Textarea
            id="task-description-main"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Add description..."
            className="min-h-[220px] w-full"
          />
        </div>


      <DeleteModal
        open={isDeleteModalOpen}
        placeholder={`delete "${activeTask.title}"`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
