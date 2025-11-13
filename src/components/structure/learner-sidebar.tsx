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
import type { MenuItem, SidebarItem as SidebarItemType, ValidRoute } from "@/config/sidebar/config"
import { learnerSidebarConfig } from "@/config/sidebar/learner"
import { getAvatarUrl } from "@/lib/avatar"
import { ChevronUpDownIcon } from "@heroicons/react/24/solid"
import { Link, useRouteContext } from "@tanstack/react-router"
import * as React from "react"

type MenuItemWithExtras = {
    isCurrent?: boolean
    badge?: string
} & MenuItem

export default function LearnerSidebar(props: React.ComponentProps<typeof Sidebar>): React.ReactNode {
    const config = learnerSidebarConfig
    const { auth } = useRouteContext({ strict: false })
    const user = auth?.session?.user

    const getBadgeForHref = (href?: string) => {
        if (!href) return undefined
        // Add badge logic here if needed in the future
        return undefined
    }

    const userAvatar = user ? getAvatarUrl({ image: user.image, name: user.name, email: user.email }) : config.footer.user.avatar
    const userName = user?.name || config.footer.user.name
    const userEmail = user?.email || config.footer.user.email

    const enhanceMenuItem = (item: SidebarItemType): SidebarItemType => {
        if (item.children && item.children.length > 0) {
            return {
                ...item,
                children: item.children.map((child) => ({
                    ...child,
                    badge: getBadgeForHref(child.href),
                })),
            }
        }

        return {
            ...item,
            badge: getBadgeForHref(item.href),
        }
    }

    const renderSidebarItem = (item: SidebarItemType, parentKey = ""): React.ReactNode => {
        const enhancedItem = enhanceMenuItem(item)
        const Icon = enhancedItem.icon
        const itemKey = `${parentKey}-${enhancedItem.label}`

        if (enhancedItem.children && enhancedItem.children.length > 0) {
            const defaultOpen = enhancedItem.defaultExpanded ?? false

            return (
                <Collapsible key={itemKey} defaultOpen={defaultOpen} className="group/collapsible">
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{enhancedItem.label}</span>
                                <ChevronUpDownIcon className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenu className="mt-1 ml-4">
                                {enhancedItem.children.map((child) => {
                                    const ChildIcon = child.icon
                                    const childWithExtras = child as MenuItemWithExtras
                                    return (
                                        <SidebarMenuItem key={childWithExtras.label}>
                                            <SidebarMenuButton asChild isActive={childWithExtras.isCurrent}>
                                                <Link to={child.href as ValidRoute}>
                                                    <ChildIcon className="mr-2 h-4 w-4" />
                                                    <span>{childWithExtras.label}</span>
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
                <SidebarMenuButton asChild isActive={enhancedItem.isCurrent} tooltip={enhancedItem.tooltip}>
                    <Link to={enhancedItem.href as ValidRoute}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{enhancedItem.label}</span>
                        {enhancedItem.badge && <SidebarMenuBadge>{enhancedItem.badge}</SidebarMenuBadge>}
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
                                            <AvatarImage src={userAvatar} alt={userName} />
                                        </Avatar>
                                        <div className="flex flex-col gap-0.5 text-left group-data-[collapsible=icon]:hidden">
                                            <span className="font-medium text-sm">{userName}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {userEmail}
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
                                            <span className="font-medium text-sm">{userName}</span>
                                            {userEmail && (
                                                <span className="text-muted-foreground text-xs">
                                                    {userEmail}
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
