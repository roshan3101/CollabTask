"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import {
  fetchOrganizationDetail,
  updateOrganization,
} from "@/stores/slices/organization.slice"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DeleteOrganizationModal } from "./components/delete-organization-modal"
import { toast } from "sonner"
import { Trash2, Users2Icon } from "lucide-react"

export default function OrganizationSettingsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const params = useParams()
  const orgId = params.orgId as string

  const { activeOrganization, isLoading, error } = useAppSelector(
    (state) => state.organizations
  )

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    website: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (orgId) {
      dispatch(fetchOrganizationDetail(orgId))
    }
  }, [dispatch, orgId])

  useEffect(() => {
    if (activeOrganization) {
      setFormData({
        name: activeOrganization.name || "",
        description: activeOrganization.description || "",
        address: activeOrganization.address || "",
        website: activeOrganization.website || "",
      })
    }
  }, [activeOrganization])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSave = async () => {
    if (!activeOrganization) return

    if (!formData.name || formData.name.trim().length < 3) {
      toast.error("Organization name must be at least 3 characters")
      return
    }

    setIsSaving(true)
    try {
      await dispatch(
        updateOrganization({
          orgId: activeOrganization.id,
          ...formData,
        })
      ).unwrap()
      toast.success("Organization settings updated successfully")
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to update organization"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading && !activeOrganization) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading organization settings...</div>
    )
  }

  if (!activeOrganization) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Organization not found</p>
        <Button variant="outline" onClick={() => router.push("/organizations")}>
          Back to Organizations
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/organizations">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/organizations/${orgId}`}>
              {activeOrganization.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Organization Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your organization details and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/organizations/${orgId}/members`)}>
              <Users2Icon className="w-4 h-4 mr-2" />
              Members
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Update your organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-id">Organization ID</Label>
            <Input
              id="org-id"
              value={activeOrganization.id}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">This is your unique organization identifier</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-name">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-name"
              placeholder="Organization Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              placeholder="What does your organization do?"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-address">Address</Label>
              <Input
                id="org-address"
                placeholder="Address of the organization"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-website">Website</Label>
              <Input
                id="org-website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-created">Created At</Label>
            <Input
              id="org-created"
              value={new Date(activeOrganization.createdAt).toLocaleString()}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-updated">Last Updated</Label>
            <Input
              id="org-updated"
              value={new Date(activeOrganization.updatedAt).toLocaleString()}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isSaving || isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Organization
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving || isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteOrganizationModal
        organization={activeOrganization}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  )
}