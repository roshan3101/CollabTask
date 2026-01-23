"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { OrganizationMember } from "@/types/organization"

interface MembersListProps {
  members: OrganizationMember[]
  isLoading?: boolean
}

const ITEMS_PER_PAGE = 10

export function MembersList({ members, isLoading }: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const getAvatarInitials = (member: OrganizationMember) => {
    return `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase() || "?"
  }

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members
    }

    const query = searchQuery.toLowerCase()
    return members.filter(
      (member) =>
        member.firstName?.toLowerCase().includes(query) ||
        member.lastName?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
    )
  }, [members, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">Loading members...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Members ({filteredMembers.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or role..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No members found matching your search" : "No members found"}
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {paginatedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    {getAvatarInitials(member)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                    {member.role || "member"}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of{" "}
                  {filteredMembers.length} members
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
