"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./ui/sidebar";
import { CalendarCheck, ChevronRight, InboxIcon, LayoutDashboardIcon, LayoutGrid, ListTodoIcon, LogOutIcon, OrbitIcon, SettingsIcon, Plus, FolderKanban } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchOrganizations } from "@/stores/slices/common.slice";
import { logout } from "@/stores/slices/auth.slice";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";

export function AppSidebar() {

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { error, isLoading, organizations } = useAppSelector((state) => state.common);
    const hasFetchedRef = useRef(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            router.push("/login");
        } catch (err) {
            const message = typeof err === "string" ? err : "Failed to logout. Please try again.";
            toast.error(message);
        }
    }

    useEffect(() => {
        if (!hasFetchedRef.current && !isLoading && organizations.length === 0) {
            hasFetchedRef.current = true;
            dispatch(fetchOrganizations());
        }
    }, [dispatch, isLoading, organizations.length]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    return (
        <Sidebar collapsible="icon">

            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem key="icon">
                                <SidebarMenuButton asChild>
                                    <a href='/'>
                                        <LayoutGrid />
                                        <span className="text-xl font-bold bg-primary-foreground text-primary rounded-lg tracking-wide">COLLABTASK</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>      
            </SidebarHeader>

            <Separator />

            <SidebarContent className="px-2">

                <SidebarMenu>
                    <SidebarMenuItem key="Dashboard">
                    <SidebarMenuButton asChild>
                        <a href={'/dashboard'}>
                            <LayoutDashboardIcon />
                            <span>Dashboard</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarMenu>
                    <SidebarMenuItem key="Inbox">
                    <SidebarMenuButton asChild>
                        <a href={'/inbox'}>
                            <InboxIcon />
                            <span>Inbox</span>
                        </a>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarGroup>
                    <SidebarGroupLabel>My Work</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem key="my_tasks">
                            <SidebarMenuButton asChild>
                                <a href={'/my-tasks'}>
                                    <ListTodoIcon />
                                    <span>My Tasks</span>
                                </a>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>

                        <SidebarMenu>
                            <SidebarMenuItem key="calendar">
                            <SidebarMenuButton asChild>
                                <a href={'/calendar'}>
                                    <CalendarCheck />
                                    <span>Calendar</span>
                                </a>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="flex items-center gap-2 w-full">
                            <OrbitIcon className="w-4 h-4" />
                            <span>Organizations</span>
                            <button
                                type="button"
                                onClick={() => router.push("/organizations/new")}
                                className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-auto"
                                aria-label="Create organization"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {organizations.length === 0 && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <OrbitIcon />
                                        <span>No Organizations</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                            {organizations.length > 0 && organizations.map((org) => (
                                <SidebarMenuItem key={org.id}>
                                    <SidebarMenuButton asChild>
                                        <a href={`/organizations/${org.id}`}>
                                            <OrbitIcon />
                                            <span>{org.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
                        <SidebarGroupLabel>
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 w-full text-left hover:text-foreground transition-colors"
                                >
                                    <FolderKanban className="w-4 h-4" />
                                    <span>Projects</span>
                                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isProjectsOpen ? 'rotate-90' : ''}`} />
                                </button>
                            </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {organizations.length === 0 && (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton disabled>
                                                <span>No Projects</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )}
                                    {organizations.map((org) => {
                                        const orgProjects = org.projects || [];
                                        if (orgProjects.length === 0) return null;
                                        
                                        return (
                                            <Collapsible key={org.id} className="group/collapsible">
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton>
                                                            <OrbitIcon />
                                                            <span>{org.name}</span>
                                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                </SidebarMenuItem>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {orgProjects.map((project) => (
                                                            <SidebarMenuSubItem key={project.id}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <a href={`/projects/${project.id}`}>
                                                                        <span>{project.name}</span>
                                                                    </a>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarGroup>

            </SidebarContent>

            <Separator />

            <SidebarFooter>
                    <SidebarGroup>
                        <SidebarGroupContent>

                            <SidebarMenuItem key="logout" onClick={handleLogout}>
                                <SidebarMenuButton>
                                    <LogOutIcon />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>


                            <SidebarMenuItem key="settings">
                                <SidebarMenuButton asChild>
                                    <a href={'/settings'}>
                                        <SettingsIcon />
                                        <span>Settings</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarGroupContent>
                    </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    )
}