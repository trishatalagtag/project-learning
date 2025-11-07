"use client"

import { Avatar } from "@/components/ui/avatar"
import { Breadcrumbs, BreadcrumbsItem } from "@/components/ui/breadcrumbs"
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { SidebarNav, SidebarTrigger } from "@/components/ui/sidebar"
import {
  ArrowRightStartOnRectangleIcon,
  HomeIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppSidebarNavProps {
  breadcrumbs?: BreadcrumbItem[]
}

export default function AppSidebarNav({ breadcrumbs }: AppSidebarNavProps) {
  return (
    <SidebarNav>
      <span className="flex items-center gap-x-4">
        <SidebarTrigger />
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs className="hidden md:flex">
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbsItem key={index} href={crumb.href || "#"}>
                {crumb.label}
              </BreadcrumbsItem>
            ))}
          </Breadcrumbs>
        )}
      </span>
      <UserMenu />
    </SidebarNav>
  )
}

function UserMenu() {
  return (
    <Menu>
      <MenuTrigger className="ml-auto md:hidden" aria-label="Open Menu">
        <Avatar
          isSquare
          alt="John Doe"
          src="https://intentui.com/images/avatar/cobain.jpg"
          initials="JD"
        />
      </MenuTrigger>
      <MenuContent popover={{ placement: "bottom end" }} className="min-w-64">
        <MenuSection>
          <MenuHeader separator>
            <span className="block">John Doe</span>
            <span className="font-normal text-muted-fg">@learner</span>
          </MenuHeader>
        </MenuSection>
        <MenuItem>
          <Link to="/learn">
            <HomeIcon />
            <MenuLabel>Dashboard</MenuLabel>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to="/settings/profile">
            <UserCircleIcon />
            <MenuLabel>Account Settings</MenuLabel>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link to="/learn/courses">
            <ShieldCheckIcon />
            <MenuLabel>Security</MenuLabel>
          </Link>
        </MenuItem>
        <MenuSeparator />
        <MenuItem>
          <Link to="/learn/library">
            <LifebuoyIcon />
            <MenuLabel>Help & Support</MenuLabel>
          </Link>
        </MenuItem>
        <MenuSeparator />
        <MenuItem>
          <ArrowRightStartOnRectangleIcon />
          <MenuLabel>Log out</MenuLabel>
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}
