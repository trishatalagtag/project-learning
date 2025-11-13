import {
    AcademicCapIcon,
    ArrowRightStartOnRectangleIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    HomeIcon,
    LifebuoyIcon,
    ListBulletIcon,
    PlusIcon,
    ShieldCheckIcon,
    UserGroupIcon
} from "@heroicons/react/24/solid"
import type { SidebarConfig } from "./config"

export const facultySidebarConfig: SidebarConfig = {
    header: {
        href: "/f",
        logo: "https://design.intentui.com/logo?color=155DFC",
        title: "Faculty",
        subtitle: "Portal",
    },
    sections: [
        {
            label: "Overview",
            items: [
                {
                    label: "Dashboard",
                    href: "/f",
                    icon: HomeIcon,
                    isCurrent: true,
                },
            ],
        },
        {
            label: "My Courses",
            items: [
                {
                    label: "Courses",
                    icon: AcademicCapIcon,
                    defaultExpanded: true,
                    children: [
                        {
                            label: "All Courses",
                            href: "/f/courses",
                            icon: ListBulletIcon,
                        },
                        {
                            label: "Create Course",
                            href: "/f/courses/new",
                            icon: PlusIcon,
                        },
                    ],
                },
            ],
        },
        {
            label: "Content Management",
            items: [
                {
                    label: "Pending Approvals",
                    href: "/f/content-approvals",
                    icon: ClipboardDocumentListIcon,
                    tooltip: "Content awaiting approval",
                },
            ],
        },
        {
            label: "Analytics",
            items: [
                {
                    label: "Reports",
                    icon: ChartBarIcon,
                    children: [
                        {
                            label: "Overview",
                            href: "/f/analytics",
                            icon: ChartBarIcon,
                        },
                        {
                            label: "Student Progress",
                            href: "/f/analytics/progress",
                            icon: UserGroupIcon,
                        },
                    ],
                },
            ],
        },
    ],
    footer: {
        user: {
            name: "Faculty User",
            email: "faculty@domain.com",
            avatar: "https://intentui.com/images/avatar/default.jpg",
            username: "@faculty",
        },
        menuItems: [
            {
                label: "Dashboard",
                href: "/f",
                icon: HomeIcon,
            },
            {
                label: "Settings",
                href: "/f/settings",
                icon: Cog6ToothIcon,
            },
            {
                label: "Security",
                href: "/f/security",
                icon: ShieldCheckIcon,
            },
            {
                label: "Support",
                href: "/f/contact",
                icon: LifebuoyIcon,
                separator: true,
            },
            {
                label: "Log out",
                href: "/f/logout",
                icon: ArrowRightStartOnRectangleIcon,
                separator: true,
            },
        ],
    },
}