"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchMyTasks } from "@/stores/slices/task.slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle2, Clock, ArrowRight, Calendar, Users, FolderKanban } from "lucide-react"
import type { Task } from "@/types/task"

export default function MyTasksPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { tasks, isLoading, error } = useAppSelector((state) => state.tasks)

  useEffect(() => {
    // Fetch only "todo" tasks
    dispatch(fetchMyTasks({ status: "todo", page_size: 100 }))
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleTaskClick = (task: Task) => {
    if (!task.org_id || !task.project_id) {
      toast.error("Unable to navigate: missing organization or project information")
      return
    }
    router.push(
      `/organizations/${task.org_id}/projects/${task.project_id}/tasks/${task.id}`
    )
  }

  const getAvatarInitials = (name?: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const todoTasks = tasks.filter((task) => task.status === "todo")

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-lg">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full px-6 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              My To-Do Tasks
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {todoTasks.length === 0
                ? "No pending tasks"
                : `${todoTasks.length} ${todoTasks.length === 1 ? "task" : "tasks"} waiting for you`}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {todoTasks.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 border-4 border-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-center max-w-md text-lg">
              You have no pending tasks. Great work! Take a moment to celebrate your productivity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {todoTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 group border-2 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
              onClick={() => handleTaskClick(task)}
            >
              <CardHeader className="pb-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {task.title}
                    </CardTitle>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Badge and Assignees */}
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium px-3 py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      To Do
                    </span>
                  </Badge>

                  {task.assignee_names && task.assignee_names.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {task.assignee_names.slice(0, 3).map((name, idx) => (
                          <div
                            key={idx}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold uppercase border-2 border-background shadow-md ring-2 ring-background"
                            title={name}
                          >
                            {getAvatarInitials(name)}
                          </div>
                        ))}
                        {task.assignee_names.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold border-2 border-background shadow-md ring-2 ring-background">
                            +{task.assignee_names.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    Updated {new Date(task.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
