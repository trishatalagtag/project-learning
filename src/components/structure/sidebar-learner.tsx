"use client"

import { Avatar } from "@/components/ui/avatar"
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
import {
  AcademicCapIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChatBubbleLeftEllipsisIcon,
  ChevronUpDownIcon,
  HomeIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { Link, useLocation } from "@tanstack/react-router"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  courseId?: string
}

export default function AppSidebar({ courseId, ...props }: AppSidebarProps) {
  const { pathname } = useLocation()

  const isInCourse = Boolean(courseId)

  const isCurrent = (path: string) => pathname === path

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link to="/learn" className="flex items-center gap-x-2">
          <Avatar
            isSquare
            size="sm"
            className="outline-hidden"
            src="https://design.intentui.com/logo?color=155DFC"
          />
          <SidebarLabel className="font-medium">Learning Platform</SidebarLabel>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarSectionGroup>
          <SidebarSection label="Main">
            <SidebarItem tooltip="Dashboard" isCurrent={isCurrent("/learn")}>
              <Link to="/learn">
                <HomeIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </Link>
            </SidebarItem>

            <SidebarItem tooltip="Catalog" isCurrent={isCurrent("/catalog")}>
              <Link to="/learn/catalog">
                <MagnifyingGlassIcon />
                <SidebarLabel>Catalog</SidebarLabel>
              </Link>
            </SidebarItem>

            <SidebarItem tooltip="My Courses" isCurrent={isCurrent("/learn/courses")}>
              <Link to="/learn/courses">
                <AcademicCapIcon />
                <SidebarLabel>My Courses</SidebarLabel>
              </Link>
            </SidebarItem>

            <SidebarItem tooltip="Progress" isCurrent={isCurrent("/learn/progress")}>
              <Link to="/learn/progress">
                <ChartBarIcon />
                <SidebarLabel>Progress</SidebarLabel>
              </Link>
            </SidebarItem>

            <SidebarItem tooltip="Feedback" isCurrent={isCurrent("/learn/feedback")}>
              <Link to="/learn/feedback">
                <ChatBubbleLeftEllipsisIcon />
                <SidebarLabel>Feedback</SidebarLabel>
              </Link>
            </SidebarItem>
          </SidebarSection>

          {isInCourse && (
            <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
              <SidebarDisclosure id={1}>
                <SidebarDisclosureTrigger>
                  <BookOpenIcon />
                  <SidebarLabel>Course</SidebarLabel>
                </SidebarDisclosureTrigger>
                <SidebarDisclosurePanel>
                  <SidebarItem
                    tooltip="Overview"
                    isCurrent={isCurrent(`/learn/courses/${courseId}`)}
                  >
                    <Link to="/learn/courses/$courseId" params={{ courseId: courseId! }}>
                      <InformationCircleIcon />
                      <SidebarLabel>Overview</SidebarLabel>
                    </Link>
                  </SidebarItem>

                  <SidebarItem tooltip="Lessons">
                    <Link to="/learn/courses/$courseId/lessons" params={{ courseId: courseId! }}>
                      <PlayCircleIcon />
                      <SidebarLabel>Lessons</SidebarLabel>
                    </Link>
                  </SidebarItem>

                  <SidebarItem tooltip="Announcements">
                    <Link
                      to="/learn/courses/$courseId"
                      params={{ courseId: courseId! }}
                      hash="announcements"
                    >
                      <MegaphoneIcon />
                      <SidebarLabel>Announcements</SidebarLabel>
                    </Link>
                  </SidebarItem>
                </SidebarDisclosurePanel>
              </SidebarDisclosure>
            </SidebarDisclosureGroup>
          )}

          <SidebarSection>
            <SidebarItem tooltip="Account" isCurrent={isCurrent("/settings/profile")}>
              <Link to="/settings/profile">
                <UserCircleIcon />
                <SidebarLabel>Account</SidebarLabel>
              </Link>
            </SidebarItem>
          </SidebarSection>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col">
        <Menu>
          <MenuTrigger className="flex w-full items-center justify-between" aria-label="Profile">
            <div className="flex items-center gap-x-2">
              <Avatar
                className="size-8 *:size-8 group-data-[state=collapsed]:size-6 group-data-[state=collapsed]:*:size-6"
                isSquare
                src="https://intentui.com/images/avatar/cobain.jpg"
                initials="JD"
              />
              <div className="in-data-[collapsible=dock]:hidden text-sm">
                <SidebarLabel>John Doe</SidebarLabel>
                <span className="-mt-0.5 block text-muted-fg">learner@example.com</span>
              </div>
            </div>
            <ChevronUpDownIcon data-slot="chevron" className="size-4" />
          </MenuTrigger>
          <MenuContent
            className="in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <MenuSection>
              <MenuHeader separator>
                <span className="block">John Doe</span>
                <span className="font-normal text-muted-fg">@learner</span>
              </MenuHeader>
            </MenuSection>

            <MenuItem>
              <Link to="/learn">
                <HomeIcon />
                Dashboard
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to="/settings/profile">
                <UserCircleIcon />
                Account Settings
              </Link>
            </MenuItem>
            <MenuItem>
              <Link to="/learn/courses">
                <ShieldCheckIcon />
                Security
              </Link>
            </MenuItem>
            <MenuSeparator />
            <MenuSeparator />
            <MenuItem>
              <ArrowRightStartOnRectangleIcon />
              <MenuLabel>Log out</MenuLabel>
            </MenuItem>
          </MenuContent>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
