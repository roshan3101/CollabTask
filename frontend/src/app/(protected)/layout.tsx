import { AppSidebar } from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default function ProtectedLayout({
    children
}: {
    children: React.ReactNode
}) {

    const isAuthenticated = true

    if(!isAuthenticated) {
        return <div>Unauthorized</div>
    }

    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full m-2">
                    <Topbar />
                    <Separator className="my-2" />
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}