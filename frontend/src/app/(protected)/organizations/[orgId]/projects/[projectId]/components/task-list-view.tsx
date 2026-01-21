"use client"

import { Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TaskListViewProps {
  tasks: Task[]
  isLoading: boolean
  onTaskClick?: (task: Task) => void
  onAddTaskClick?: () => void
}

export function TaskListView({
  tasks,
  isLoading,
  onTaskClick,
  onAddTaskClick,
}: TaskListViewProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading tasks...
      </div>
    )
  }

  if (!tasks.length) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>No tasks yet</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create your first task to get started with this project.
            </p>
          </div>
          {onAddTaskClick && (
            <Button onClick={onAddTaskClick} size="sm">
              New Task
            </Button>
          )}
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        {onAddTaskClick && (
          <Button onClick={onAddTaskClick} size="sm">
            New Task
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className={onTaskClick ? "cursor-pointer" : ""}
                onClick={() => onTaskClick?.(task)}
              >
                <TableCell className="font-medium">
                  {task.title}
                </TableCell>
                <TableCell className="capitalize text-xs">
                  {task.status.replace("_", " ")}
                </TableCell>
                <TableCell className="text-sm">
                  {task.assignee_names && task.assignee_names.length > 0
                    ? task.assignee_names.join(", ")
                    : "Unassigned"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(task.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

