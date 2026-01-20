import { Building, CalendarCheck, InboxIcon, LayoutDashboardIcon, ListTodoIcon, LucideIcon } from "lucide-react"

interface SidebarItemsType {
    title: string
    url: string
    icon: LucideIcon
    isDropdown: boolean
}

export const sidebarItems : SidebarItemsType[] = [
    {
        title: "Dashboard",
        url: "",
        icon: LayoutDashboardIcon,
        isDropdown: false
    },
    {
        title: "Inbox",
        url: "",
        icon: InboxIcon,
        isDropdown: false
    },
    {
        title: "My Tasks",
        url: "",
        icon: ListTodoIcon,
        isDropdown: false
    },
    {
        title: "Calendar",
        url: "",
        icon: CalendarCheck,
        isDropdown: false
    },
    {
        title: "My Work",
        url: "",
        icon: Building,
        isDropdown: false
    },
    {
        title: "Organizations",
        url: "",
        icon: Building,
        isDropdown: true
    },
]
