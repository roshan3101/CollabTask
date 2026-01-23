"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, Settings, Users2 } from "lucide-react"
import type { Organization } from "@/types/organization"

interface OrganizationHeaderProps {
  organization: Organization
  onSettingsClick: () => void
  onMembersClick: () => void
  onProjectsClick: () => void
}

export function OrganizationHeader({
  organization,
  onSettingsClick,
  onMembersClick,
  onProjectsClick,
}: OrganizationHeaderProps) {
  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  const canSettings = organization.role === "admin" || organization.role === "owner"

  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{organization.name}</h1>
          <Badge variant={getRoleBadgeVariant(organization.role)}>
            {organization.role || "member"}
          </Badge>
        </div>
        {organization.description && (
          <p className="text-muted-foreground mt-2">{organization.description}</p>
        )}
        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
          {organization.address && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{organization.address}</span>
            </div>
          )}
          {organization.website && (
            <div className="flex items-center gap-1">
              <span>🌐</span>
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {organization.website}
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {canSettings && (
          <Button variant="outline" onClick={onSettingsClick}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
        <Button variant="outline" onClick={onProjectsClick}>
          <FolderKanban className="w-4 h-4 mr-2" />
          Projects
        </Button>
      </div>
    </div>
  )
}
