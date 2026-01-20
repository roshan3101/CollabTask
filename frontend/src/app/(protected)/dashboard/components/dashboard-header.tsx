import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardHeader () {
    return (
        <div className="flex items-center justify-between">
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
    )
}