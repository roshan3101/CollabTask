"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Organization } from "@/types/organization"

interface ProjectsSectionProps {
  organization: Organization
  orgId: string
}

export function ProjectsSection({ organization, orgId }: ProjectsSectionProps) {
  const router = useRouter()
  const canEdit = organization.role === "admin" || organization.role === "owner"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Projects</CardTitle>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/organizations/${orgId}/projects/new`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>Projects will be listed here</p>
          <p className="text-xs mt-2">Coming soon...</p>
        </div>
      </CardContent>
    </Card>
  )
}
