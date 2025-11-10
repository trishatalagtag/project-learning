import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { adminSidebarConfig } from "@/config/sidebar/admin"
import type { MenuItem, SidebarItem as SidebarItemType, ValidRoute } from "@/config/sidebar/config"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"
import * as React from "react"

type MenuItemWithExtras = {
  isCurrent?: boolean
  badge?: string
} & MenuItem

export default function AdminSidebar(props: React.ComponentProps<typeof Sidebar>): React.ReactNode {
  const config = adminSidebarConfig

  const renderSidebarItem = (item: SidebarItemType, parentKey = ""): React.ReactNode => {
    const Icon = item.icon
    const itemKey = `${parentKey}-${item.label}`

    if (item.children && item.children.length > 0) {
      const defaultOpen = item.defaultExpanded ?? false

      return (
        <Collapsible key={itemKey} defaultOpen={defaultOpen} className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                <ChevronUpDownIcon className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="ml-4 mt-1">
                {item.children.map((child) => {
                  const ChildIcon = child.icon
                  const childWithExtras = child as MenuItemWithExtras
                  return (
                    <SidebarMenuItem key={child.label}>
                      <SidebarMenuButton asChild isActive={childWithExtras.isCurrent}>
                        <Link to={child.href as ValidRoute}>
                          <ChildIcon className="mr-2 h-4 w-4" />
                          <span>{child.label}</span>
                          {childWithExtras.badge && (
                            <SidebarMenuBadge>{childWithExtras.badge}</SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={itemKey}>
        <SidebarMenuButton asChild isActive={item.isCurrent} tooltip={item.tooltip}>
          <Link to={item.href as ValidRoute}>
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
            {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={config.header.href as ValidRoute} className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{config.header.title}</span>
                  {config.header.subtitle && (
                    <span className="text-muted-foreground text-xs">{config.header.subtitle}</span>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {config.sections.map((section) => (
          <SidebarGroup key={section.label} className="py-0">
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => renderSidebarItem(item, section.label))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="w-full">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8 group-data-[collapsible=icon]:size-6">
                      <AvatarImage src={config.footer.user.avatar} alt={config.footer.user.name} />
                    </Avatar>
                    <div className="flex flex-col gap-0.5 text-left group-data-[collapsible=icon]:hidden">
                      <span className="font-medium text-sm">{config.footer.user.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {config.footer.user.email}
                      </span>
                    </div>
                  </div>
                  <ChevronUpDownIcon className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="end"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{config.footer.user.name}</span>
                      {config.footer.user.username && (
                        <span className="text-muted-foreground text-xs">
                          {config.footer.user.username}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {config.footer.menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <React.Fragment key={item.href}>
                      {item.separator && <DropdownMenuSeparator />}
                      <DropdownMenuItem asChild>
                        <Link to={item.href as ValidRoute} className="flex w-full items-center">
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    </React.Fragment>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
