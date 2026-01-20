"use client"

import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/stores/hooks"
import { deleteOrganization } from "@/stores/slices/organization.slice"
import { DeleteModal } from "@/components/ui/delete-modal"
import { toast } from "sonner"
import type { Organization } from "@/types/organization"

interface DeleteOrganizationModalProps {
  organization: Organization
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteOrganizationModal({
  organization,
  open,
  onOpenChange,
}: DeleteOrganizationModalProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleDelete = async () => {
    if (!organization) return

    try {
      await dispatch(deleteOrganization(organization.id)).unwrap()
      toast.success("Organization deleted successfully")
      router.push("/organizations")
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to delete organization"
      toast.error(message)
    }
  }

  return (
    <DeleteModal
      open={open}
      placeholder={`delete ${organization.name}`}
      onConfirm={handleDelete}
      onCancel={() => onOpenChange(false)}
    />
  )
}
