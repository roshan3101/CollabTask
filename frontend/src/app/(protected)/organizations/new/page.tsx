"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { createOrganization } from "@/stores/slices/organization.slice"
import { organizationService } from "@/services/organization.service"
import type { CreateOrganizationInput, InviteMemberInput } from "@/types/organization"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { toast } from "sonner"

type WizardStep = 1 | 2 | 3

export default function NewOrganizationPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { isLoading } = useAppSelector((state) => state.organizations)

  const [step, setStep] = useState<WizardStep>(1)
  const [details, setDetails] = useState<CreateOrganizationInput>({
    name: "",
    description: "",
    address: "",
    website: "",
  })
  const [invites, setInvites] = useState<InviteMemberInput[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<InviteMemberInput["role"]>("member")

  const handleNextFromDetails = () => {
    if (!details.name || details.name.trim().length < 3) {
      toast.error("Organization name must be at least 3 characters.")
      return
    }
    setStep(2)
  }

  const handleAddInvite = () => {
    if (!inviteEmail.trim()) return
    setInvites((prev) => [...prev, { email: inviteEmail.trim(), role: inviteRole }])
    setInviteEmail("")
    setInviteRole("member")
  }

  const handleCreate = async () => {
    try {
      const resultAction = await dispatch(createOrganization(details)).unwrap()
      const orgId = resultAction.id

      if (invites.length > 0) {
        const addMemberPromises = invites.map((invite) =>
          organizationService.addMember(orgId, invite)
        )

        const results = await Promise.allSettled(addMemberPromises)
        const failed = results.filter((r) => r.status === "rejected").length

        if (failed > 0) {
          toast.warning(
            `Organization created, but ${failed} member invite(s) failed. You can add them later.`
          )
        } else {
          toast.success(`Organization created and ${invites.length} member(s) invited successfully`)
        }
      } else {
        toast.success("Organization created successfully")
      }

      router.push(`/organizations/${orgId}`)
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to create organization"
      toast.error(message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/organizations">Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Organization</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold">Create Organization</h1>
        <p className="text-muted-foreground text-sm">
          Set up your organization in a simple 2-step wizard.
        </p>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setStep(1)
              }}
              className={step === 1 ? "font-semibold" : ""}
            >
              1. Details
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (details.name && details.name.trim().length >= 3) setStep(2)
              }}
              className={step === 2 ? "font-semibold" : ""}
            >
              2. Members
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (details.name && details.name.trim().length >= 3) setStep(3)
              }}
              className={step === 3 ? "font-semibold" : ""}
            >
              3. Confirm
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {step === 1 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Organization Name"
                value={details.name}
                onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <textarea
                id="org-description"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="What does your organization do?"
                value={details.description}
                onChange={(e) => setDetails((d) => ({ ...d, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-address">Address (optional)</Label>
                <Input
                  id="org-address"
                  placeholder="Address of the organization"
                  value={details.address}
                  onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-website">Website (optional)</Label>
                <Input
                  id="org-website"
                  placeholder="https://example.com"
                  value={details.website}
                  onChange={(e) => setDetails((d) => ({ ...d, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleNextFromDetails}>Next: Members</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Invite Members (optional)</Label>
              <p className="text-xs text-muted-foreground">
                You can invite team members now or skip and add them later.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 items-center">
              <Input
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <select
                className="border border-input rounded-md px-2 py-1 text-sm bg-background"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as InviteMemberInput["role"])}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="button" variant="outline" onClick={handleAddInvite}>
                Add
              </Button>
            </div>

            {invites.length > 0 && (
              <div className="space-y-2">
                <Label>Pending Invites</Label>
                <ul className="text-sm space-y-1">
                  {invites.map((inv, idx) => (
                    <li key={`${inv.email}-${idx}`} className="flex justify-between">
                      <span>
                        {inv.email} ·{" "}
                        <span className="uppercase text-[10px] tracking-wide text-muted-foreground">
                          {inv.role}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Skip &amp; Continue
                </Button>
                <Button onClick={() => setStep(3)}>Next: Confirm</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Review &amp; Create</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Organization:</span> {details.name}
              </div>
              {details.description && (
                <div>
                  <span className="font-medium">Description:</span> {details.description}
                </div>
              )}
              {(details.address || details.website) && (
                <div>
                  <span className="font-medium">Contact:</span>{" "}
                  {details.address && `Address: ${details.address}`}
                  {details.address && details.website && " · "}
                  {details.website && `Website: ${details.website}`}
                </div>
              )}
              <div>
                <span className="font-medium">Invites:</span>{" "}
                {invites.length === 0
                  ? "None (you can add members later)"
                  : `${invites.length} pending invite(s)`}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

