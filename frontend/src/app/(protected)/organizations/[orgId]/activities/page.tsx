"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppSelector } from "@/stores/hooks"
import { activityService, type Activity } from "@/services/activity.service"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ChevronLeft, ChevronRight, Activity as ActivityIcon } from "lucide-react"
import { toast } from "sonner"

const ACTION_LABELS: Record<string, string> = {
  task_created: "Task Created",
  task_status_changed: "Task Status Changed",
  task_description_updated: "Task Description Updated",
  task_assigned: "Task Assigned",
  task_unassigned: "Task Unassigned",
  task_title_updated: "Task Title Updated",
  project_created: "Project Created",
  project_updated: "Project Updated",
  project_archived: "Project Archived",
  project_restored: "Project Restored",
  organization_created: "Organization Created",
  organization_updated: "Organization Updated",
  organization_deleted: "Organization Deleted",
  member_added: "Member Added",
  member_removed: "Member Removed",
  member_role_changed: "Member Role Changed",
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  task: "Task",
  project: "Project",
  organization: "Organization",
}

export default function ActivitiesPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const { activeOrganization } = useAppSelector((state) => state.organizations)

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all")
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all")

  useEffect(() => {
    fetchActivities()
  }, [orgId, page, entityTypeFilter, actionTypeFilter])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const response = await activityService.getOrganizationActivities(orgId, {
        page,
        page_size: 50,
        entity_type: entityTypeFilter !== "all" ? entityTypeFilter : undefined,
        action_type: actionTypeFilter !== "all" ? actionTypeFilter : undefined,
      })

      if (response.success && response.data) {
        setActivities(response.data.activities)
        setTotalPages(response.data.pagination.total_pages)
      } else {
        toast.error(response.error || "Failed to load activities")
      }
    } catch (err) {
      toast.error("Failed to load activities")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionColor = (action: string) => {
    if (action.includes("created")) return "bg-green-100 text-green-800"
    if (action.includes("updated") || action.includes("changed")) return "bg-blue-100 text-blue-800"
    if (action.includes("deleted") || action.includes("removed") || action.includes("archived"))
      return "bg-red-100 text-red-800"
    if (action.includes("restored") || action.includes("added")) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/organizations/${orgId}`}>
              {activeOrganization?.name || "Organization"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Activities</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
          <p className="text-muted-foreground">View all activities in this organization</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Entity Type</label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={
                      entityTypeFilter === "all"
                        ? "All Types"
                        : entityTypeFilter === "task"
                          ? "Tasks"
                          : entityTypeFilter === "project"
                            ? "Projects"
                            : "Organizations"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="organization">Organizations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={
                      actionTypeFilter === "all"
                        ? "All Actions"
                        : ACTION_LABELS[actionTypeFilter] || actionTypeFilter
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="task_created">Task Created</SelectItem>
                  <SelectItem value="task_status_changed">Status Changed</SelectItem>
                  <SelectItem value="project_created">Project Created</SelectItem>
                  <SelectItem value="member_added">Member Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No activities found</div>
          ) : (
            <>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getActionColor(activity.action)}>
                          {ACTION_LABELS[activity.action] || activity.action}
                        </Badge>
                        <Badge variant="outline">
                          {ENTITY_TYPE_LABELS[activity.entity_type] || activity.entity_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </p>
                      {Object.keys(activity.metadata || {}).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <details>
                            <summary className="cursor-pointer hover:text-foreground">
                              View details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
