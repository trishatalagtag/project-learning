"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"
import {
  BookOpenIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"
import { PencilIcon } from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { ModuleItem } from "./course-content-tab/module-item"

interface CourseContentTabProps {
  courseId: Id<"courses">
}

/**
 * Course Content Tab - Admin View
 *
 * Displays course modules and lessons with:
 * - Read-only overview of course structure
 * - Approval/rejection actions for pending content
 * - Statistics dashboard
 * - Expand/collapse controls
 */
export function CourseContentTab({ courseId }: CourseContentTabProps) {
  const modules = useQuery(api.faculty.modules.listModulesByCourse, {
    courseId,
  })

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const expandAll = () => {
    if (modules) {
      setExpandedModules(new Set(modules.map((m) => m._id)))
    }
  }

  const collapseAll = () => {
    setExpandedModules(new Set())
  }

  const allExpanded = useMemo(() => {
    return modules && expandedModules.size === modules.length
  }, [modules, expandedModules])

  // Calculate stats
  const stats = useMemo(() => {
    if (!modules) return null

    return {
      total: modules.length,
      published: modules.filter((m) => m.status === CONTENT_STATUS.PUBLISHED).length,
      pending: modules.filter((m) => m.status === CONTENT_STATUS.PENDING).length,
      totalLessons: modules.reduce((sum, m) => sum + m.lessonCount, 0),
    }
  }, [modules])

  // Loading state
  if (modules === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading course content...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Empty>
            <EmptyMedia>
              <BookOpenIcon className="h-12 w-12" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No modules yet</EmptyTitle>
              <EmptyDescription>
                This course doesn't have any modules. Faculty can create modules in the faculty
                dashboard.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Course Content</ItemTitle>
          <ItemDescription>
            Review and approve course modules and lessons
          </ItemDescription>

          {stats && (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{stats.total}</span>
                <span className="text-muted-foreground">
                  {stats.total === 1 ? "Module" : "Modules"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{stats.totalLessons}</span>
                <span className="text-muted-foreground">
                  {stats.totalLessons === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>

              {stats.published > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{stats.published}</span>
                  <span className="text-muted-foreground">Published</span>
                </div>
              )}

              {stats.pending > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-2 text-sm">
                        <ExclamationCircleIcon className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">{stats.pending}</span>
                        <span className="text-muted-foreground">Needs Review</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">These items require your approval</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </ItemContent>

        <ItemActions>
          <Button variant="outline" size="sm" asChild>
            <Link to="/c/$courseId" params={{ courseId }}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Manage Content
            </Link>
          </Button>

          {modules.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={allExpanded ? collapseAll : expandAll}
            >
              {allExpanded ? (
                <>
                  <ChevronDownIcon className="mr-2 h-4 w-4" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronRightIcon className="mr-2 h-4 w-4" />
                  Expand All
                </>
              )}
            </Button>
          )}
        </ItemActions>
      </Item>

      <div className="space-y-4">
        {modules.map((module, index) => (
          <ModuleItem
            key={module._id}
            module={module}
            courseId={courseId}
            moduleNumber={index + 1}
            isExpanded={expandedModules.has(module._id)}
            onToggle={() => toggleModule(module._id)}
          />
        ))}
      </div>
    </div>
  )
}