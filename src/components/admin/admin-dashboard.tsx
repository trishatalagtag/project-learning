"use client"

import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs"
import { api } from "api"
import { useQuery } from "convex/react"
import { useMemo, type JSX } from "react"
import { PendingApprovals } from "./pending-approvals/pending-approvals"
import { StatisticsDashboard } from "./statistics/statistics-dashboard"
import { CheckSquareOffsetIcon } from "@phosphor-icons/react"
import { ChartLineIcon } from "@phosphor-icons/react"

export function AdminDashboard(): JSX.Element {
  const pendingCourses = useQuery(api.admin.courses.getPendingCourses, { limit: 100 })
  const pendingContent = useQuery(api.admin.content.listPendingContent, {})

  const totalPendingContent = useMemo((): number => {
    if (!pendingContent) return 0
    return (
      pendingContent.modules.length +
      pendingContent.lessons.length +
      pendingContent.quizzes.length +
      pendingContent.assignments.length
    )
  }, [pendingContent])

  const totalPending = (pendingCourses?.length ?? 0) + totalPendingContent
  const showBadge = pendingCourses !== undefined && totalPending > 0

  return (
    <Container>
      <Tabs aria-label="Admin Dashboard Navigation" defaultSelectedKey="approvals">
        <TabList>
          <Tab id="approvals">
            <CheckSquareOffsetIcon/>
            Pending Approvals
            {showBadge && (
              <Badge intent="warning" className="ml-2">
                {totalPending}
              </Badge>
            )}
          </Tab>
          <Tab id="stats">
            
            <ChartLineIcon/>
            Statistics</Tab>
        </TabList>
        <TabPanel id="approvals">
          <PendingApprovals />
        </TabPanel>

        <TabPanel id="stats">
          <StatisticsDashboard />
        </TabPanel>
      </Tabs>
    </Container>
  )
}
