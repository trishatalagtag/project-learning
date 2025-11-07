"use client"

import { ChevronUpDownIcon } from "@heroicons/react/24/outline"
import { Link } from "@tanstack/react-router"
import { Avatar } from "@/components/ui/avatar"
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  Sidebar,
  SidebarContent,
  SidebarDisclosure,
  SidebarDisclosureGroup,
  SidebarDisclosurePanel,
  SidebarDisclosureTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
} from "@/components/ui/sidebar"
import { adminSidebarConfig } from "@/config/sidebar/admin"
import type { SidebarItem as SidebarItemType, ValidRoute } from "@/config/sidebar/config"

export default function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const config = adminSidebarConfig

  const renderSidebarItem = (item: SidebarItemType, parentKey = ""): React.ReactNode => {
    const Icon = item.icon
    const itemKey = `${parentKey}-${item.label}`

    if (item.children && item.children.length > 0) {
      const defaultKeys = item.defaultExpanded ? [itemKey] : []
      
      return (
        <SidebarDisclosureGroup key={itemKey} defaultExpandedKeys={defaultKeys}>
          <SidebarDisclosure id={itemKey}>
            <SidebarDisclosureTrigger>
              <Icon />
              <SidebarLabel>{item.label}</SidebarLabel>
            </SidebarDisclosureTrigger>
            <SidebarDisclosurePanel>
              {item.children?.map((child) => {
                const ChildIcon = child.icon
                return (
                  <SidebarItem key={child.label} href={child.href as ValidRoute} tooltip={child.label}>
                    <ChildIcon />
                    <SidebarLabel>{child.label}</SidebarLabel>
                  </SidebarItem>
                )
              })}
            </SidebarDisclosurePanel>
          </SidebarDisclosure>
        </SidebarDisclosureGroup>
      )
    }

    // Simple item without children
    return (
      <SidebarItem
        key={itemKey}
        tooltip={item.tooltip}
        isCurrent={item.isCurrent}
        href={item.href as ValidRoute}
        badge={item.badge}
      >
        <Icon />
        <SidebarLabel>{item.label}</SidebarLabel>
      </SidebarItem>
    )
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link to={config.header.href as ValidRoute} className="flex items-center">
          <Avatar
            isSquare
            size="sm"
            className="outline-hidden"
            src={config.header.logo}
          />
          <SidebarLabel className="font-medium">
            {config.header.title}{" "}
            {config.header.subtitle && (
              <span className="text-muted-fg">{config.header.subtitle}</span>
            )}
          </SidebarLabel>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSectionGroup>
          {config.sections.map((section) => (
            <SidebarSection key={section.label} label={section.label}>
              {section.items.map((item) => renderSidebarItem(item, section.label))}
            </SidebarSection>
          ))}
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
        <Menu>
          <MenuTrigger className="flex w-full items-center justify-between" aria-label="Profile">
            <div className="flex items-center gap-x-2">
              <Avatar
                className="size-8 *:size-8 group-data-[state=collapsed]:size-6 group-data-[state=collapsed]:*:size-6"
                isSquare
                src={config.footer.user.avatar}
              />
              <div className="in-data-[collapsible=dock]:hidden text-sm">
                <SidebarLabel>{config.footer.user.name}</SidebarLabel>
                <span className="-mt-0.5 block text-muted-fg">
                  {config.footer.user.email}
                </span>
              </div>
            </div>
            <ChevronUpDownIcon data-slot="chevron" />
          </MenuTrigger>
          <MenuContent
            className="in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <MenuSection>
              <MenuHeader separator>
                <span className="block">{config.footer.user.name}</span>
                {config.footer.user.username && (
                  <span className="font-normal text-muted-fg">
                    {config.footer.user.username}
                  </span>
                )}
              </MenuHeader>
            </MenuSection>

            {config.footer.menuItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.href}>
                  {item.separator && <MenuSeparator />}
                  <MenuItem href={item.href as ValidRoute}>
                    <Icon />
                    {item.label}
                  </MenuItem>
                </div>
              )
            })}
          </MenuContent>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}