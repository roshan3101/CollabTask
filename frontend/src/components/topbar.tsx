"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "./ui/input"
import { SidebarTrigger } from "./ui/sidebar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { BellIcon, UserIcon, Settings, LogOut, Search } from "lucide-react"
import { useAppSelector } from "@/stores/hooks"
import { useAppDispatch } from "@/stores/hooks"
import { logout } from "@/stores/slices/auth.slice"
import { DeleteModal } from "./ui/delete-modal"
import { ThemeToggle } from "./theme-toggle"
import { toast } from "sonner"
import { useNotifications } from "@/hooks/use-notifications"
import { Badge } from "./ui/badge"

export default function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { unreadCount } = useNotifications()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      router.push("/")
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to logout. Please try again."
      toast.error(message)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      toast.error("Search query must be at least 2 characters")
    }
  }

  const getAvatarInitials = () => {
    if (!user) return "?"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?"
  }

  const getUserDisplayName = () => {
    if (!user) return "User"
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User"
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger />
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tasks, projects, organizations..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/inbox")}
            className="relative"
          >
            <BellIcon className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  {getAvatarInitials()}
                </div>
                <span className="hidden sm:inline-block">{getUserDisplayName()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsLogoutModalOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DeleteModal
        open={isLogoutModalOpen}
        placeholder="logout"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  )
}
