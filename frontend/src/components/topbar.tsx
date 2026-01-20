"use client"

import { Input } from "./ui/input"
import { SidebarTrigger } from "./ui/sidebar"
import { Button } from "./ui/button"
import { BellIcon, UserIcon } from "lucide-react"

export default function Topbar() {
    return (
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Input type="text" placeholder="Search tasks, projects ..." className="sm:w-2xl w-full" />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">
                    <BellIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                    <UserIcon className="w-4 h-4" />
                    <span>Roshan</span>
                </Button>
            </div>
        </div>
    )
}