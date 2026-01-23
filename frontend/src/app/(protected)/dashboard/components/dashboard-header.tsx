"use client"

import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, CheckCircle2, Clock, Users } from "lucide-react"
import DashboardCards from "./dashboard-cards"
import type { DashboardAnalytics } from "@/services/dashboard.service"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
    analytics: DashboardAnalytics | null
    isLoading?: boolean
}

export default function DashboardHeader({ analytics, isLoading }: DashboardHeaderProps) {
    const router = useRouter()

    const dashboardCards = [
        {
            icon: <Clock className="w-4 h-4" />,
            title: "Active Tasks",
            value: analytics?.active_tasks?.toString() || "0",
            description: "Tasks that are currently in progress or to do"
        },
        {
            icon: <CheckCircle2 className="w-4 h-4" />,
            title: "Completed",
            value: analytics?.complete_tasks?.toString() || "0",
            description: "Tasks that have been completed"
        },
        {
            icon: <FolderKanban className="w-4 h-4" />,
            title: "Projects",
            value: analytics?.total_projects?.toString() || "0",
            description: "Total number of active projects"
        },
        {
            icon: <Users className="w-4 h-4" />,
            title: "Team Members",
            value: analytics?.team_members?.toString() || "0",
            description: "Total number of team members across all organizations"
        }
    ]

    const handleNewProject = () => {
        router.push("/organizations")
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">
                        Welcome Back!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here&apos;s what&apos;s happening with your projects
                    </p>
                </div>

                <Button className="gap-2" onClick={handleNewProject}>
                    <Plus className="w-4 h-4" />
                    New Project
                </Button>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {dashboardCards.map((card, index) => (
                    <DashboardCards 
                        key={index} 
                        {...card} 
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </>
    )
}