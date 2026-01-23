"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import {
  fetchOrganizationDetail,
  fetchOrganizationMembers,
} from "@/stores/slices/organization.slice"
import { organizationService } from "@/services/organization.service"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Activity } from "lucide-react"
import { toast } from "sonner"
import { MembersList } from "./components/members-list"

interface OrganizationAnalytics {
  total_projects: number
  total_members: number
  total_tasks: number
  active_tasks: number
  completed_tasks: number
}

export default function OrganizationDetailPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string

  const { activeOrganization, isLoading, error, members } = useAppSelector(
    (state) => state.organizations
  )

  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  useEffect(() => {
    if (orgId) {
      dispatch(fetchOrganizationDetail(orgId))
      dispatch(fetchOrganizationMembers({ orgId, includePending: false }))
      fetchAnalytics()
    }
  }, [dispatch, orgId])

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true)
    try {
      const response = await organizationService.getOrganizationAnalytics(orgId)
      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        toast.error(response.error || "Failed to load analytics")
      }
    } catch (err) {
      toast.error("Failed to load analytics")
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  if (isLoading && !activeOrganization) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading organization...</div>
    )
  }

  if (!activeOrganization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Organization not found</p>
        <Button variant="outline" onClick={() => router.push("/organizations")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
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
            <BreadcrumbPage>{activeOrganization.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Organization Name and Description Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{activeOrganization.name}</h1>
          {activeOrganization.description && (
            <p className="text-muted-foreground mb-3">{activeOrganization.description}</p>
          )}
          {analytics && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
              <p>
                <span className="font-medium">Total Projects:</span> {analytics.total_projects}
              </p>
              <p>
                <span className="font-medium">Total Members:</span> {analytics.total_members}
              </p>
              <p>
                <span className="font-medium">Total Tasks:</span> {analytics.total_tasks}
              </p>
              <p>
                <span className="font-medium">Active Tasks:</span> {analytics.active_tasks}
              </p>
              <p>
                <span className="font-medium">Completed Tasks:</span> {analytics.completed_tasks}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {(activeOrganization.role === "admin" || activeOrganization.role === "owner") && (
            <Button
              variant="outline"
              onClick={() => router.push(`/organizations/${orgId}/settings`)}
            >
              Settings
            </Button>
          )}
            <Button variant="outline" onClick={() => router.push(`/organizations/${orgId}/projects`)}>
              Projects
            </Button>
            {(activeOrganization?.role === "admin" || activeOrganization?.role === "owner") && (
              <Button
                variant="outline"
                onClick={() => router.push(`/organizations/${orgId}/activities`)}
              >
                <Activity className="w-4 h-4 mr-2" />
                Activity Log
              </Button>
            )}
        </div>
      </div>

      {/* Members List - Left Half */}
      <div className="grid gap-6 lg:grid-cols-2 min-h-[600px] max-h-[600px]">
        <div>
          <MembersList members={members} isLoading={isLoading} />
        </div>
        <div>
          {/* Right side can be used for other content in the future */}
        </div>
      </div>
    </div>
  )
}
