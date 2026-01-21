"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchOrganizations } from "@/stores/slices/organization.slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Plus } from "lucide-react"
import { toast } from "sonner"


export default function OrganizationsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { organizations, isLoading, error } = useAppSelector((state) => state.organizations)

  useEffect(() => {
    dispatch(fetchOrganizations())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleCreateClick = () => {
    router.push("/organizations/new")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Organizations</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-semibold mt-2">Organizations</h1>
          <p className="text-muted-foreground text-sm">
            Manage your organizations, members, and settings
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {isLoading && organizations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Loading organizations...</div>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No organizations yet</p>
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{org.name}</CardTitle>
                {org.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {org.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/organizations/${org.id}`)}
                    className="gap-2"
                  >
                    Details
                    <span>→</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
