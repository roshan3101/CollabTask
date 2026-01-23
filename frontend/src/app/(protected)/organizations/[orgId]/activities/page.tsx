"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAppSelector } from "@/stores/hooks"
import {
  activityService,
  type Activity,
  type FilterOption,
} from "@/services/activity.service"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, ChevronLeft, ChevronRight, Activity as ActivityIcon, Info } from "lucide-react"
import { toast } from "sonner"

const ACTION_LABELS: Record<string, string> = {
  task_created: "created task",
  task_status_changed: "changed status of task",
  task_description_updated: "updated description of task",
  task_assigned: "assigned task",
  task_unassigned: "unassigned task",
  task_title_updated: "renamed task",
  project_created: "created project",
  project_updated: "updated project",
  project_archived: "archived project",
  project_restored: "restored project",
  organization_created: "created organization",
  organization_updated: "updated organization",
  organization_deleted: "deleted organization",
  member_added: "added member",
  member_removed: "removed member",
  member_role_changed: "changed role of member",
}

const ENTITY_LABELS: Record<string, string> = {
  task: "Task",
  project: "Project",
  organization: "Organization",
}

function formatActivityDetail(activity: Activity): string {
  const user = activity.user_name || "Someone"
  const action = ACTION_LABELS[activity.action] || activity.action.replace(/_/g, " ")
  const entity = activity.entity_name ? `"${activity.entity_name}"` : ""
  const project = activity.project_name ? ` in project "${activity.project_name}"` : ""

  if (activity.entity_type === "task") {
    return `${user} ${action} ${entity}${project}`.trim()
  }
  if (activity.entity_type === "project") {
    return `${user} ${action} ${entity}`.trim()
  }
  if (activity.entity_type === "organization") {
    return `${user} ${action} ${entity}`.trim()
  }
  return `${user} ${action} ${entity}`.trim() || `${user} performed an action`
}

export default function ActivitiesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const { activeOrganization } = useAppSelector((state) => state.organizations)

  const [activities, setActivities] = useState<Activity[]>([])
  const [filterOptions, setFilterOptions] = useState<{
    entity_types: FilterOption[]
    action_types: FilterOption[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all")
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all")

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await activityService.getOrganizationActivities(orgId, {
        page,
        page_size: pageSize,
        entity_type: entityTypeFilter !== "all" ? entityTypeFilter : undefined,
        action_type: actionTypeFilter !== "all" ? actionTypeFilter : undefined,
      })

      if (response.success && response.data) {
        setActivities(response.data.activities)
        setTotal(response.data.pagination.total)
        setTotalPages(response.data.pagination.total_pages)
        setPageSize(response.data.pagination.page_size)
        if (response.data.filter_options) {
          setFilterOptions(response.data.filter_options)
        }
      } else {
        toast.error(response.error || "Failed to load activities")
      }
    } catch (err) {
      toast.error("Failed to load activities")
    } finally {
      setIsLoading(false)
    }
  }, [orgId, page, pageSize, entityTypeFilter, actionTypeFilter])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

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
    if (action.includes("created")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    if (action.includes("updated") || action.includes("changed"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    if (action.includes("deleted") || action.includes("removed") || action.includes("archived"))
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    if (action.includes("restored") || action.includes("added"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const entityTypes = filterOptions?.entity_types ?? [
    { value: "task", label: "Task" },
    { value: "project", label: "Project" },
    { value: "organization", label: "Organization" },
  ]
  const actionTypes = filterOptions?.action_types ?? Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

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

      <div>
        <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
        <p className="text-muted-foreground">View all activities in this organization</p>
      </div>

      {/* Inline filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Entity type</label>
          <Select
            value={entityTypeFilter}
            onValueChange={(v) => {
              setEntityTypeFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {entityTypes.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Action type</label>
          <Select
            value={actionTypeFilter}
            onValueChange={(v) => {
              setActionTypeFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actionTypes.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activities list */}
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
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className={getActionColor(activity.action)}>
                          {ACTION_LABELS[activity.action] || activity.action.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline" className="text-muted-foreground font-normal">
                          {ENTITY_LABELS[activity.entity_type] || activity.entity_type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatActivityDetail(activity)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(activity.created_at)}
                        </p>
                        {Object.keys(activity.metadata || {}).length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label="View details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="left"
                              className="max-w-sm max-h-64 overflow-auto text-left whitespace-pre-wrap font-mono"
                            >
                              <pre className="text-xs">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startItem}–{endItem} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isLoading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages || isLoading}
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
