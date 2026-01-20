import { OrganizationMember } from "@/types/organization"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface MemberSectionProps {
    members: OrganizationMember[]
    canEdit: boolean
    isOwner: boolean
    currentUserEmail: string | undefined
    handleRemoveMember: (userId: string) => void
    handleChangeRole: (userId: string, role: "member" | "admin" | "owner") => void
}

export function MemberSection({
    members,
    canEdit,
    isOwner,
    currentUserEmail,
    handleRemoveMember,
    handleChangeRole
}: MemberSectionProps) {

    const getRoleBadgeVariant = (role?: string) => {
        switch (role) {
        case "owner":
            return "default"
        case "admin":
            return "secondary"
        default:
            return "outline"
        }
    }

    const isCurrentUser = (memberEmail: string) => {
        return currentUserEmail === memberEmail
    }

    return (
        <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {canEdit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
            </TableHeader>

            <TableBody>
                {members.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground">No members yet</TableCell>
                    </TableRow>
                ) : (
                    members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell>{member.firstName} {member.lastName}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                {isOwner && !isCurrentUser(member.email) ? (
                                    <select
                                        value={member.role || "member"}
                                        onChange={(e) => handleChangeRole(member.id, e.target.value as "member" | "admin" | "owner")}
                                        className="h-7 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="member">member</option>
                                        <option value="admin">admin</option>
                                        <option value="owner">owner</option>
                                    </select>
                                ) : (
                                    <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                                )}
                            </TableCell>
                            {canEdit && (
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleRemoveMember(member.id)} 
                                        className="text-destructive"
                                        disabled={isCurrentUser(member.email) && member.role === "owner"}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
        </>
    )
}