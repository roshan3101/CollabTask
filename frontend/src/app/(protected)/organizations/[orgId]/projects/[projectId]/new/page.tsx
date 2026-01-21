"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchOrganizationDetail } from "@/stores/slices/organization.slice"
import { fetchProjectDetail } from "@/stores/slices/project.slice"
import { createTask } from "@/stores/slices/task.slice"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { TaskStatus } from "@/types/task"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "done", label: "Done" },
]

export default function NewTaskWizardPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string
  const projectId = params.projectId as string

  const { activeOrganization } = useAppSelector((state) => state.organizations)
  const { activeProject } = useAppSelector((state) => state.projects)
  const { isLoading, error } = useAppSelector((state) => state.tasks)

  const [step, setStep] = useState(0)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
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
    if (orgId) {
      dispatch(fetchOrganizationDetail(orgId))
      // Fetch organization members for assignee selection
      setIsLoadingMembers(true)
      organizationService
        .getOrganizationMembers(orgId)
        .then((response) => {
          if (response.success && response.data) {
            setMembers(response.data)
          }
        })
        .catch(() => {
          toast.error("Failed to load organization members")
        })
        .finally(() => {
          setIsLoadingMembers(false)
        })
    }
    if (orgId && projectId) {
      dispatch(fetchProjectDetail({ orgId, projectId }))
    }
  }, [dispatch, orgId, projectId])

  useEffect(() => {
    if (error) {
      toast.error(error as string)
    }
  }, [error])

  const canGoNextFromStep0 = formData.title.trim().length >= 3

  const handleNext = () => {
    if (step === 0 && !canGoNextFromStep0) {
      toast.error("Task title must be at least 3 characters")
      return
    }
    setStep((prev) => Math.min(prev + 1, 1))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleCreateTask = async () => {
    // Only allow creation on step 1 (final step)
    if (step !== 1) {
      return
    }

    if (!canGoNextFromStep0) {
      toast.error("Task title must be at least 3 characters")
      return
    }

    try {
      await dispatch(
        createTask({
          orgId,
          projectId,
          payload: {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            status: formData.status,
            assignee_ids: formData.assignee_ids.length > 0 ? formData.assignee_ids : [],
          },
        })
      ).unwrap()

      toast.success("Task created successfully")
      router.push(`/organizations/${orgId}/projects/${projectId}`)
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to create task"
      toast.error(message)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only handle "Next" action on step 0
    if (step === 0 && canGoNextFromStep0) {
      handleNext()
    }
    // Do not allow form submission - only button clicks can create tasks
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
            <BreadcrumbLink href={`/organizations/${orgId}/projects/${projectId}`}>
              {activeProject?.name || "Project"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Task</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold">Create New Task</h1>
        <p className="text-muted-foreground text-sm">
          Use the wizard to provide all the task details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Wizard</CardTitle>
          <CardDescription>
            Step {step + 1} of 2 — {step === 0 ? "Basic information" : "Additional settings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleFormSubmit} 
            className="space-y-8"
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="task-title">
                    Task Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (canGoNextFromStep0) {
                          handleNext()
                        }
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Describe what needs to be done"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      // Prevent form submission on Enter key
                      if (e.key === "Enter" && e.ctrlKey) {
                        // Allow Ctrl+Enter for new line
                        return
                      }
                      // Don't prevent default for normal Enter (allows new lines in textarea)
                    }}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <select
                    id="task-status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as TaskStatus,
                      }))
                    }
                    onKeyDown={(e) => {
                      // Prevent form submission when pressing Enter in select
                      if (e.key === "Enter") {
                        e.preventDefault()
                      }
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-assignees">Assignees (optional)</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {isLoadingMembers ? (
                      <p className="text-sm text-muted-foreground">Loading members...</p>
                    ) : members.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members available</p>
                    ) : (
                      members.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignee_ids.includes(member.id)}
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
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">
                            {member.firstName} {member.lastName} ({member.email})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select one or more members to assign to this task.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/organizations/${orgId}/projects/${projectId}`)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
                    Back
                  </Button>
                )}
                {step < 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNextFromStep0 || isLoading}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleCreateTask}
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Task"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

