import { Button } from "@/components/ui/button";
import { Plus, UsersIcon } from "lucide-react";
import DashboardCards from "./dashboard-cards";

const dashboardCards = [
    {
        icon: <UsersIcon className="w-4 h-4" />,
        title: "Total Users",
        value: "100",
        description: "Total number of users in the system"
    },
    {
        icon: <UsersIcon className="w-4 h-4" />,
        title: "Total Users",
        value: "100",
        description: "Total number of users in the system"
    },
    {
        icon: <UsersIcon className="w-4 h-4" />,
        title: "Total Users",
        value: "100",
        description: "Total number of users in the system"
    },
    {
        icon: <UsersIcon className="w-4 h-4" />,
        title: "Total Users",
        value: "100",
        description: "Total number of users in the system"
    }
]

export default function DashboardHeader () {
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

            <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
            </Button>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {dashboardCards.map((card, index) => (
                <DashboardCards key={index} {...card} />
            ))}
        </div>
        </>
    )
}