"use client"

import { organizationService } from "@/services/organization.service"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchOrganizationDetail, fetchOrganizationMembers } from "@/stores/slices/organization.slice"
import { Organization } from "@/types/organization"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import { useParams } from "next/navigation"
import { AddMemberDialog } from "./components/add-member-dialog"
import { MemberSection } from "./components/member-section"
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { useRouter } from "next/navigation"


export default function OrganizationMembersPage(){
    const { orgId } = useParams<{ orgId: string }>()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { members, activeOrganization } = useAppSelector((state) => state.organizations)
    const { user } = useAppSelector((state) => state.auth)
    const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)

    useEffect(() => {   
        dispatch(fetchOrganizationMembers(orgId as string))
        dispatch(fetchOrganizationDetail(orgId as string))
    }, [dispatch, orgId])

    const canEdit = activeOrganization?.role == 'admin' || activeOrganization?.role == 'owner' || false
    const isOwner = activeOrganization?.role === 'owner'
    const isNonOwner = activeOrganization?.role !== 'owner'

    const handleRemoveMember = async(userId: string) => {
        try{
            const response = await organizationService.removeMember(orgId, userId)
            if(response.success){
                toast.success("Member removed successfully")
                await dispatch(fetchOrganizationMembers(orgId as string))
            } else {
                toast.error(response.error || response.message)
            }
        } catch (err) {
            toast.error("Failed to remove member")
        }
    }

    const handleChangeRole = async (userId: string, role: "member" | "admin" | "owner") => {
        try {
            const response = await organizationService.changeMemberRole(orgId, userId, role)
            if (response.success) {
                toast.success("Member role updated successfully")
                await dispatch(fetchOrganizationMembers(orgId as string))
            } else {
                toast.error(response.error || response.message)
            }
        } catch (err) {
            toast.error("Failed to change member role")
        }
    }

    const handleLeaveOrganization = async () => {
        if (!confirm("Are you sure you want to leave this organization?")) {
            return
        }

        try {
            const response = await organizationService.leaveOrganization(orgId)
            if (response.success) {
                toast.success("You have left the organization")
                router.push("/organizations")
            } else {
                toast.error(response.error || response.message)
            }
        } catch (err) {
            toast.error("Failed to leave organization")
        }
    }

    return (
        <>
        <Breadcrumb className="mb-6">
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/organizations" onClick={(e) => {
                    e.preventDefault()
                    router.push("/organizations")
                }}>Organizations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbLink href={`/organizations/${orgId}`} onClick={(e) => {
                    e.preventDefault()
                    router.push(`/organizations/${orgId}`)
                }}>{activeOrganization?.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>Members</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
        </Breadcrumb>
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Members</h1>
                <div className="flex items-center gap-2">
                    {isNonOwner && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleLeaveOrganization}
                            className="text-destructive hover:text-destructive"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave Organization
                        </Button>
                    )}
                    {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => setIsAddMemberDialogOpen(true)} disabled={!canEdit}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Member
                        </Button>
                    )}
                </div>
            </div>

            <div className="border rounded-md">
                <MemberSection 
                    members={members} 
                    canEdit={canEdit} 
                    isOwner={isOwner}
                    currentUserEmail={user?.email}
                    handleRemoveMember={handleRemoveMember}
                    handleChangeRole={handleChangeRole}
                />
            </div>
        </div>

        <AddMemberDialog
            organization={activeOrganization as Organization}
            open={isAddMemberDialogOpen}
            onOpenChange={setIsAddMemberDialogOpen}
        />
        </>
    )
}