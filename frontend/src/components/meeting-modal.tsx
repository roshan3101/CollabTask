"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { meetingService } from "@/services/meeting.service"
import type { OrganizationMember } from "@/types/organization"

interface MeetingModalProps {
  orgId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  members: OrganizationMember[]
}

export function MeetingModal({ orgId, open, onOpenChange, members }: MeetingModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [googleMeetLink, setGoogleMeetLink] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const resetState = () => {
    setTitle("")
    setDescription("")
    setGoogleMeetLink("")
    setStartTime("")
    setEndTime("")
    setSelectedParticipantIds([])
  }

  const toggleParticipant = (id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!googleMeetLink.trim()) {
      toast.error("Google Meet link is required")
      return
    }
    if (!startTime || !endTime) {
      toast.error("Start and end time are required")
      return
    }

    setIsSaving(true)
    try {
      const res = await meetingService.createMeeting(orgId, {
        title: title.trim(),
        description: description.trim() || undefined,
        google_meet_link: googleMeetLink.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        participant_ids: selectedParticipantIds,
      })

      if (res.success) {
        toast.success(res.message || "Meeting created")
        resetState()
        onOpenChange(false)
      } else {
        toast.error(res.message || "Failed to create meeting")
      }
    } catch {
      toast.error("Failed to create meeting")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetState()
        }
        onOpenChange(value)
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Title</Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting-description">Description</Label>
            <Textarea
              id="meeting-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meeting-link">Google Meet link</Label>
            <Input
              id="meeting-link"
              placeholder="https://meet.google.com/..."
              value={googleMeetLink}
              onChange={(e) => setGoogleMeetLink(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-start">Start time</Label>
              <Input
                id="meeting-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-end">End time</Label>
              <Input
                id="meeting-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-auto border rounded-md p-2">
            <Label>Select participants</Label>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleParticipant(m.id)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-accent ${
                  selectedParticipantIds.includes(m.id) ? "bg-accent" : ""
                }`}
              >
                <span>
                  {m.firstName} {m.lastName} ({m.email})
                </span>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetState()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSaving}>
            {isSaving ? "Creating..." : "Create meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

