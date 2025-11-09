import {
  AcademicCapIcon as AcademicCapOutlineIcon,
  ArrowUpTrayIcon,
  ChartPieIcon,
  ListBulletIcon,
  PlusIcon,
  TagIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline"
import {
  AcademicCapIcon,
  ArrowRightStartOnRectangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon,
  HomeIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/solid"
import type { SidebarConfig } from "./config"

export const adminSidebarConfig: SidebarConfig = {
  header: {
    href: "/a",
    logo: "https://design.intentui.com/logo?color=155DFC",
    title: "Admin",
    subtitle: "Portal",
  },
  sections: [
    {
      label: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/a",
          icon: HomeIcon,
          isCurrent: true,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          label: "Courses",
          icon: AcademicCapIcon,
          defaultExpanded: true,
          children: [
            {
              label: "All Courses",
              href: "/a/courses",
              icon: ListBulletIcon,
            },
            {
              label: "Create Course",
              href: "/a/courses/new",
              icon: PlusIcon,
            },
          ],
        },
        {
          label: "Users",
          icon: UsersIcon,
          children: [
            {
              label: "All Users",
              href: "/a/users",
              icon: ListBulletIcon,
            },
            {
              label: "Add User",
              href: "/a/users/new",
              icon: UserPlusIcon,
            },
          ],
        },
        {
          label: "Categories",
          icon: FolderIcon,
          children: [
            {
              label: "All Categories",
              href: "/a/categories",
              icon: ListBulletIcon,
            },
            {
              label: "Create Category",
              href: "/a/categories/new",
              icon: PlusIcon,
            },
            {
              label: "Organize",
              href: "/a/categories/organize",
              icon: TagIcon,
            },
          ],
        },
      ],
    },
    {
      label: "Moderation",
      items: [
        {
          label: "Content Approval",
          href: "/a/content-approval",
          icon: ShieldCheckIcon,
          badge: "12",
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
              href: "/a/analytics",
              icon: ChartBarIcon,
            },
            {
              label: "Enrollments",
              href: "/a/analytics/enrollments",
              icon: ChartPieIcon,
            },
            {
              label: "Performance",
              href: "/a/analytics/courses",
              icon: AcademicCapOutlineIcon,
            },
          ],
        },
      ],
    },
  ],
  footer: {
    user: {
      name: "Kurt Cobain",
      email: "kurt@domain.com",
      avatar: "https://intentui.com/images/avatar/cobain.jpg",
      username: "@cobain",
    },
    menuItems: [
      {
        label: "Dashboard",
        href: "/a",
        icon: HomeIcon,
      },
      {
        label: "Settings",
        href: "/a/settings",
        icon: Cog6ToothIcon,
      },
      {
        label: "Security",
        href: "/a/security",
        icon: ShieldCheckIcon,
      },
      {
        label: "Support",
        href: "/a/contact",
        icon: LifebuoyIcon,
        separator: true,
      },
      {
        label: "Log out",
        href: "/a/logout",
        icon: ArrowRightStartOnRectangleIcon,
        separator: true,
      },
    ],
  },
}
