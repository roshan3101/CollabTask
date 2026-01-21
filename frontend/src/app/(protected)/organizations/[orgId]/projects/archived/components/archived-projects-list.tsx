import { Project } from "@/types/project"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Archive, Calendar, RotateCcw } from "lucide-react"

interface ArchivedProjectsListProps {
  projects: Project[]
  isLoading: boolean
  orgId: string
  onRestore: (projectId: string, projectName: string) => void
}

export function ArchivedProjectsList({
  projects,
  isLoading,
  orgId,
  onRestore,
}: ArchivedProjectsListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading archived projects...</div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Archive className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No archived projects</h3>
          <p className="text-muted-foreground text-sm">
            Projects you archive will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              Archived {new Date(project.updatedAt).toLocaleDateString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onRestore(project.id, project.name)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Project
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
