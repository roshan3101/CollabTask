"use client"

import { Project } from "@/types/project"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"

interface ProjectSettingsProps {
  project: Project
  formData: {
    name: string
    description: string
  }
  onFormDataChange: (data: { name: string; description: string }) => void
  onSave: () => void
  onArchive: () => void
  isSaving: boolean
}

export function ProjectSettings({
  project,
  formData,
  onFormDataChange,
  onSave,
  onArchive,
  isSaving,
}: ProjectSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Project Settings</h2>
        {!project.is_archieved && (
          <Button variant="destructive" onClick={onArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Archive Project
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Manage your project details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={(e) =>
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description"
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Created At</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(project.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving} size="lg">
          {isSaving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
