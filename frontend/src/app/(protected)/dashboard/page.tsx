"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/stores/hooks"
import { fetchDashboardAnalytics, fetchRecentProjects } from "@/stores/slices/dashboard.slice"
import DashboardHeader from "./components/dashboard-header"
import RecentProjects from "./components/recent-projects"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function DashboardPage() {
    const dispatch = useAppDispatch()
    const { analytics, recentProjects, isLoading, error } = useAppSelector(
        (state) => state.dashboard
    )

    useEffect(() => {
        dispatch(fetchDashboardAnalytics())
        dispatch(fetchRecentProjects(3))
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    return (
        <div className="w-full h-full space-y-6 px-4 py-6">
            <DashboardHeader analytics={analytics} isLoading={isLoading} />
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Projects</h2>
                <RecentProjects projects={recentProjects} isLoading={isLoading} />
            </div>
        </div>
    )
}