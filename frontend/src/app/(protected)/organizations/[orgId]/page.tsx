"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import {
  fetchOrganizationDetail,
} from "@/stores/slices/organization.slice"
import { OrganizationHeader } from "./components/organization-header"
import { ProjectsSection } from "./components/projects-section"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function OrganizationDetailPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string

  const { activeOrganization, isLoading, error } = useAppSelector(
    (state) => state.organizations
  )

  useEffect(() => {
    if (orgId) {
      dispatch(fetchOrganizationDetail(orgId))
    }
  }, [dispatch, orgId])

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

      <OrganizationHeader
        organization={activeOrganization}
        onSettingsClick={() => router.push(`/organizations/${orgId}/settings`)}
        onMembersClick={() => router.push(`/organizations/${orgId}/members`)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ProjectsSection organization={activeOrganization} orgId={orgId} />
      </div>
    </div>
  )
}
