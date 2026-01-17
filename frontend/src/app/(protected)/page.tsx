"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { logout } from "@/stores/slices/auth.slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storageUtils } from "@/lib/storage"

export default function Dashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const isAuthenticated = storageUtils.isAuthenticated()
    if (!isAuthenticated && !accessToken) {
      router.push("/login")
    }
  }, [accessToken, router])

  const handleLogout = async () => {
    await dispatch(logout())
    router.push("/login")
  }

  return (
    <div className="p-6 min-h-screen bg-linear-to-br from-primary/10 to-accent/10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">CollabTask Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome, {user?.firstName} {user?.lastName}!</p>
          </div>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-semibold text-xs break-all">{user?.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Backend is real. Frontend is catching up.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                More features coming soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
