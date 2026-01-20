"use client"

import { useState, useEffect } from "react"
import { useAppDispatch } from "@/stores/hooks"
import { fetchOrganizationMembers } from "@/stores/slices/organization.slice"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"
import { organizationService } from "@/services/organization.service"
import { toast } from "sonner"
import type { Organization, InviteMemberInput } from "@/types/organization"

interface AddMemberDialogProps {
  organization: Organization
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({
  organization,
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const dispatch = useAppDispatch()
  const [inviteForm, setInviteForm] = useState<InviteMemberInput>({
    email: "",
    role: "member",
  })

  useEffect(() => {
    if (!open) {
      setInviteForm({ email: "", role: "member" })
    }
  }, [open])

  const handleAddMember = async () => {
    if (!organization || !inviteForm.email.trim()) return

    try {
      const response = await organizationService.addMember(organization.id, inviteForm)
      if (response.success) {
        toast.success("Member added successfully")
        onOpenChange(false)
        await dispatch(fetchOrganizationMembers(organization.id))
      } else {
        toast.error(response.error || response.message)
      }
    } catch (err) {
      toast.error("Failed to add member")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Invite a member to this organization</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="member@example.com"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm((f) => ({ ...f, role: e.target.value as InviteMemberInput["role"] }))
              }
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMember}>
            <Mail className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
