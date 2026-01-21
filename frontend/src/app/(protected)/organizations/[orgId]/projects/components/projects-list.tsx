import { Project } from "@/types/project"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderKanban, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProjectsListProps {
  projects: Project[]
  isLoading: boolean
  orgId: string
}

export function ProjectsList({ projects, isLoading, orgId }: ProjectsListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Get started by creating your first project
          </p>
          <Button onClick={() => router.push(`/organizations/${orgId}/projects/new`)}>
            <FolderKanban className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/organizations/${orgId}/projects/${project.id}`)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
