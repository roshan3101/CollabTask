import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, LayoutPanelLeftIcon, List, Settings } from "lucide-react"

export type ViewType = "kanban" | "list" | "settings"

interface ProjectActionsProps {
  view: ViewType
  onViewChange: (view: ViewType) => void
  onNewTask: () => void
}

export function ProjectActions({ view, onViewChange, onNewTask }: ProjectActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onNewTask}>
        <Plus className="w-4 h-4 mr-2" />
        New Task
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewChange("kanban")}>
            <LayoutPanelLeftIcon className="w-4 h-4 mr-2" />
            Kanban Board View
            {view === "kanban" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onViewChange("list")}>
            <List className="w-4 h-4 mr-2" />
            List View
            {view === "list" && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onViewChange("settings")}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
