"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAppSelector } from "@/stores/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { commentService } from "@/services/comment.service"
import type { Comment } from "@/types/comment"
import { toast } from "sonner"
import { MoreVertical, Edit, Trash2 } from "lucide-react"

export function ProjectComments() {
  const params = useParams()
  const orgId = params.orgId as string
  const projectId = params.projectId as string

  const { user } = useAppSelector((state) => state.auth)

  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const loadComments = async () => {
    if (!orgId || !projectId) return
    setIsLoading(true)
    try {
      const res = await commentService.listComments(orgId, projectId)
      if (res.success && res.data) {
        setComments(res.data)
      } else if (!res.success) {
        toast.error(res.message || "Failed to load comments")
      }
    } catch {
      toast.error("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, projectId])

  const handleAddComment = async () => {
    const text = newComment.trim()
    if (!text) return

    setIsSubmitting(true)
    try {
      const res = await commentService.createComment(orgId, projectId, text)
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data as Comment])
        setNewComment("")
      } else {
        toast.error(res.message || "Failed to add comment")
      }
    } catch {
      toast.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const handleSaveEdit = async (commentId: string) => {
    const text = editContent.trim()
    if (!text) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      const res = await commentService.updateComment(orgId, projectId, commentId, text)
      if (res.success && res.data) {
        const updatedComment = res.data
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? updatedComment : c))
        )
        setEditingId(null)
        setEditContent("")
        toast.success("Comment updated successfully")
      } else {
        toast.error(res.message || "Failed to update comment")
      }
    } catch {
      toast.error("Failed to update comment")
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await commentService.deleteComment(orgId, projectId, commentId)
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        toast.success("Comment deleted successfully")
      } else {
        toast.error(res.message || "Failed to delete comment")
      }
    } catch {
      toast.error("Failed to delete comment")
    }
  }

  const getAvatarInitials = (commentUser: Comment["user"]) => {
    const firstName = commentUser.firstName || ""
    const lastName = commentUser.lastName || ""
    const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()
    return initials || (commentUser.email?.[0]?.toUpperCase() || "?")
  }

  const getUserDisplayName = (commentUser: Comment["user"]) => {
    if (commentUser.firstName || commentUser.lastName) {
      return `${commentUser.firstName || ""} ${commentUser.lastName || ""}`.trim()
    }
    return commentUser.email || "User"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto border rounded-md p-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first to comment.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 group">
                {/* Avatar */}
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {getAvatarInitials(c.user)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {getUserDisplayName(c.user)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    {user?.id && c.user.id === user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStartEdit(c)}
                            className="cursor-pointer"
                          >
                            <Edit className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void handleDelete(c.id)}
                            variant="destructive"
                            className="cursor-pointer"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Comment content */}
                  {editingId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] text-xs"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => void handleSaveEdit(c.id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-1 whitespace-pre-wrap wrap-break-word">
                      {c.content}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] text-xs"
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={isSubmitting || !newComment.trim()} onClick={handleAddComment}>
              {isSubmitting ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

