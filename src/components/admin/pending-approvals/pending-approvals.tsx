"use client"

import { Badge } from "@/components/ui/badge"
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs"
import { api } from "api"
import { useQuery } from "convex/react"
import { type JSX, useMemo, useState } from "react"
import { PendingContentTable } from "./pending-content-table"
import { PendingCoursesTable } from "./pending-courses-table"
import { PreviewModal } from "./preview-modal"
import type { PendingContentItem, PendingCourse } from "./types"

export function PendingApprovals(): JSX.Element {
  const [previewItem, setPreviewItem] = useState<PendingCourse | PendingContentItem | null>(null)

  const pendingCourses = useQuery(api.admin.courses.getPendingCourses, { limit: 100 })
  const pendingContent = useQuery(api.admin.content.listPendingContent, {})

  const totalContent = useMemo((): number => {
    if (!pendingContent) return 0
    return (
      pendingContent.modules.length +
      pendingContent.lessons.length +
      pendingContent.quizzes.length +
      pendingContent.assignments.length
    )
  }, [pendingContent])

  return (
    <>
      <Tabs aria-label="Pending Approvals" defaultSelectedKey="courses">
        <TabList>
          <Tab id="courses">
            Pending Courses
            {pendingCourses && pendingCourses.length > 0 && (
              <Badge intent="warning" className="ml-2">
                {pendingCourses.length}
              </Badge>
            )}
          </Tab>
          <Tab id="content">
            Pending Content
            {totalContent > 0 && (
              <Badge intent="warning" className="ml-2">
                {totalContent}
              </Badge>
            )}
          </Tab>
        </TabList>

        <TabPanel id="courses">
          <PendingCoursesTable courses={pendingCourses} onPreview={setPreviewItem} />
        </TabPanel>

        <TabPanel id="content">
          <PendingContentTable content={pendingContent} onPreview={setPreviewItem} />
        </TabPanel>
      </Tabs>

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  )
}
