"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { ArrowRight, Palette, Grid3x3, Settings } from "lucide-react"
import type { RecentProject } from "@/services/dashboard.service"

interface RecentProjectsProps {
  projects: RecentProject[]
  isLoading?: boolean
}

const PROJECT_ICONS = [
  <Palette key="palette" className="w-5 h-5" />,
  <Grid3x3 key="grid" className="w-5 h-5" />,
  <Settings key="settings" className="w-5 h-5" />,
]

export default function RecentProjects({ projects, isLoading }: RecentProjectsProps) {
  const router = useRouter()

  const handleProjectClick = (project: RecentProject) => {
    router.push(`/organizations/${project.org_id}/projects/${project.id}`)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No projects found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {projects.map((project, index) => {
        const progressPercentage =
          project.total_tasks > 0
            ? Math.round((project.completed_tasks / project.total_tasks) * 100)
            : 0

        return (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            onClick={() => handleProjectClick(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {PROJECT_ICONS[index % PROJECT_ICONS.length]}
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {project.completed_tasks}/{project.total_tasks}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
