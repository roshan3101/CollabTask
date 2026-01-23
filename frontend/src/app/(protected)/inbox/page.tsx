"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notificationService } from "@/services/notification.service"
import { organizationService } from "@/services/organization.service"
import { useNotifications } from "@/hooks/use-notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  InboxIcon,
  CheckCheck,
  UserPlus,
  ChevronRight,
  Bell,
  Check,
  X,
} from "lucide-react"
import type { Notification } from "@/types/notification"

export default function InboxPage() {
  const router = useRouter()
  const {
    notifications: socketNotifications,
    setNotificationsList,
    markAsRead: markAsReadSocket,
    markAllAsRead: markAllAsReadSocket,
  } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    const res = await notificationService.listNotifications({
      page_size: 100,
      unread_only: unreadOnly,
    })
    setIsLoading(false)
    if (res.success && res.data?.notifications) {
      const fetchedNotifications = res.data.notifications
      setNotifications(fetchedNotifications)
      setNotificationsList(fetchedNotifications)
    } else if (!res.success && res.error) {
      toast.error(res.message || "Failed to load notifications")
    }
  }, [unreadOnly, setNotificationsList])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (socketNotifications.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id))
        const newFromSocket = socketNotifications.filter(
          (n) => !existingIds.has(n.id)
        )
        return [...newFromSocket, ...prev]
      })
    }
  }, [socketNotifications])

  const handleMarkRead = async (n: Notification) => {
    if (n.read) return
    const res = await notificationService.markRead(n.id)
    if (res.success) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      )
      markAsReadSocket(n.id)
    } else {
      toast.error(res.message || "Failed to mark as read")
    }
  }

  const handleMarkAllRead = async () => {
    const res = await notificationService.markAllRead()
    if (res.success) {
      toast.success(res.message || "All marked as read")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      markAllAsReadSocket()
      fetchNotifications()
    } else {
      toast.error(res.message || "Failed to mark all as read")
    }
  }

  const handleNotificationClick = async (n: Notification) => {
    await handleMarkRead(n)
    if (n.type === "org_invite" && n.metadata?.org_id) {
      router.push(`/organizations/${n.metadata.org_id}`)
    }
  }

  const handleAcceptInvite = async (n: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!n.metadata?.org_id) return

    const res = await organizationService.acceptInvitation(n.metadata.org_id)
    if (res.success) {
      toast.success("Invitation accepted successfully")
      setNotifications((prev) => prev.filter((x) => x.id !== n.id))
      markAsReadSocket(n.id)
      router.push(`/organizations/${n.metadata.org_id}`)
    } else {
      toast.error(res.message || "Failed to accept invitation")
    }
  }

  const handleRejectInvite = async (n: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!n.metadata?.org_id) return

    const res = await organizationService.rejectInvitation(n.metadata.org_id)
    if (res.success) {
      toast.success("Invitation rejected")
      setNotifications((prev) => prev.filter((x) => x.id !== n.id))
      markAsReadSocket(n.id)
    } else {
      toast.error(res.message || "Failed to reject invitation")
    }
  }

  const unreadCount = notifications.filter((x) => !x.read).length
  const displayNotifications = unreadOnly
    ? notifications.filter((x) => !x.read)
    : notifications

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-lg">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <InboxIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Inbox
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                {displayNotifications.length === 0
                  ? "No notifications"
                  : `${displayNotifications.length} notification${displayNotifications.length === 1 ? "" : "s"}`}
                {!unreadOnly && unreadCount > 0 && ` · ${unreadCount} unread`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={unreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setUnreadOnly(!unreadOnly)}
            >
              <Bell className="w-4 h-4 mr-2" />
              {unreadOnly ? "All" : "Unread only"}
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {displayNotifications.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl opacity-50" />
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 border-4 border-primary/20">
                <InboxIcon className="w-12 h-12 text-primary/60" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center max-w-md text-lg">
              {unreadOnly
                ? "You have no unread notifications."
                : "When someone invites you to an organization or mentions you, you’ll see it here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayNotifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${
                !n.read ? "border-l-4 border-l-primary bg-primary/5" : ""
              }`}
              onClick={() => void handleNotificationClick(n)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={`shrink-0 p-2 rounded-lg ${
                    n.read ? "bg-muted" : "bg-primary/10"
                  }`}
                >
                  {n.type === "org_invite" ? (
                    <UserPlus
                      className={`w-5 h-5 ${n.read ? "text-muted-foreground" : "text-primary"}`}
                    />
                  ) : (
                    <Bell
                      className={`w-5 h-5 ${n.read ? "text-muted-foreground" : "text-primary"}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`font-semibold ${n.read ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {n.title}
                    </h3>
                    {!n.read && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-muted-foreground/80 text-xs mt-2">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                  {n.type === "org_invite" && n.metadata?.org_id && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => handleAcceptInvite(n, e)}
                        className="h-8 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleRejectInvite(n, e)}
                        className="h-8 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
                {n.type === "org_invite" && n.metadata?.org_id && !n.read && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
