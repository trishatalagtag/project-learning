import type { LinkProps } from "@tanstack/react-router"
import type { ComponentType, SVGProps } from "react"

export type ValidRoute = LinkProps["to"]
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export type MenuItem = {
  label: string
  href: ValidRoute
  icon: IconComponent
  isCurrent?: boolean
  badge?: string
}

export type SidebarItem = {
  label: string
  href?: ValidRoute
  icon: IconComponent
  tooltip?: string
  badge?: string
  isCurrent?: boolean
  children?: MenuItem[]
  childrenRenderAs?: "menu" | "nested"
  menuLabel?: string
  defaultExpanded?: boolean
}

export type SidebarSection = {
  label: string
  collapsible?: boolean
  defaultExpanded?: boolean
  items: SidebarItem[]
}

export type UserProfileMenuItem = {
  label: string
  href: ValidRoute
  icon: IconComponent
  separator?: boolean
}

export type SidebarConfig = {
  header: {
    href: ValidRoute
    logo: string
    title: string
    subtitle?: string
  }
  sections: SidebarSection[]
  footer: {
    user: {
      name: string
      email: string
      avatar: string
      username?: string
    }
    menuItems: UserProfileMenuItem[]
  }
}
