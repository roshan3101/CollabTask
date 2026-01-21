"use client"

import React, { useState } from "react"
import { Task, TaskStatus } from "@/types/task"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onAddTaskClick?: () => void
  onStatusChange?: (task: Task, status: TaskStatus) => void
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
}

const statuses: TaskStatus[] = ["todo", "in_progress", "review", "done"]

export function KanbanBoard({ tasks, onTaskClick, onAddTaskClick, onStatusChange }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const tasksByStatus = statuses.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status)
      return acc
    },
    {} as Record<TaskStatus, Task[]>
  )

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // NOTE: Drag & drop is currently only visual; it does not persist to the backend.
  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return
    onStatusChange?.(draggedTask, status)
    setDraggedTask(null)
  }

  const getAvatarInitials = (name?: string | null) => {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex gap-4 md:gap-6 w-max">
          {statuses.map((status) => (
            <div
              key={status}
              className="shrink-0 w-72 md:w-80 flex flex-col rounded-lg border border-border bg-muted/20"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-sm">
                    {STATUS_LABELS[status]}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {tasksByStatus[status].length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
                className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[450px] max-h-[450px]"
              >
                {tasksByStatus[status].map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => onTaskClick?.(task)}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-background border-border"
                  >
                    <p className="font-medium text-sm text-foreground mb-2 line-clamp-2">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                        {STATUS_LABELS[task.status]}
                      </Badge>

                    {task.assignee_names && task.assignee_names.length > 0 && (
                      <div className="flex -space-x-1">
                        {task.assignee_names.slice(0, 3).map((name, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[10px] font-medium uppercase border-2 border-background"
                            title={name}
                          >
                            {getAvatarInitials(name)}
                          </div>
                        ))}
                        {task.assignee_names.length > 3 && (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[10px] font-medium uppercase border-2 border-background">
                            +{task.assignee_names.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </Card>
                ))}

                {/* Add Task Button */}
                <button
                  type="button"
                  onClick={onAddTaskClick}
                  className="w-full flex items-center justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md px-2 py-1 mt-2 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
