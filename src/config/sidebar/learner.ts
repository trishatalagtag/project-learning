import {
    AcademicCapIcon,
    ArrowRightStartOnRectangleIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    HomeIcon,
    LifebuoyIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/solid"
import type { SidebarConfig } from "./config"

export const learnerSidebarConfig: SidebarConfig = {
    header: {
        href: "/c/courses",
        logo: "https://design.intentui.com/logo?color=10B981",
        title: "Learner",
        subtitle: "Portal",
    },
    sections: [
        {
            label: "Overview",
            items: [
                {
                    label: "My Courses",
                    href: "/c/courses",
                    icon: AcademicCapIcon,
                    isCurrent: true,
                },
            ],
        },
        {
            label: "Progress",
            items: [
                {
                    label: "My Progress",
                    href: "/c/progress",
                    icon: ChartBarIcon,
                },
            ],
        },
        {
            label: "Submissions",
            items: [
                {
                    label: "My Submissions",
                    href: "/c/submissions",
                    icon: ClipboardDocumentListIcon,
                },
            ],
        },
    ],
    footer: {
        user: {
            name: "Learner User",
            email: "learner@domain.com",
            avatar: "https://intentui.com/images/avatar/default.jpg",
            username: "@learner",
        },
        menuItems: [
            {
                label: "My Courses",
                href: "/c/courses",
                icon: HomeIcon,
            },
            {
                label: "Settings",
                href: "/c/settings",
                icon: Cog6ToothIcon,
            },
            {
                label: "Security",
                href: "/c/security",
                icon: ShieldCheckIcon,
            },
            {
                label: "Support",
                href: "/c/contact",
                icon: LifebuoyIcon,
                separator: true,
            },
            {
                label: "Log out",
                href: "/c/logout",
                icon: ArrowRightStartOnRectangleIcon,
                separator: true,
            },
        ],
    },
}
