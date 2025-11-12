"use client"

import { Badge } from "@/components/ui/badge"
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
  ChevronRightIcon, ClipboardDocumentListIcon,
  DocumentTextIcon,
  ExclamationCircleIcon, PencilIcon
} from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { AssignmentItem } from "./course-content-tab/assignment-item"
import { ModuleItem } from "./course-content-tab/module-item"
import { QuizItem } from "./course-content-tab/quiz-item"

interface CourseContentTabProps {
  courseId: Id<"courses">
}

type ContentStats = {
  total: number
  published: number
  pending: number
  totalLessons: number
  totalQuizzes?: number
  pendingQuizzes?: number
  totalAssignments?: number
  pendingAssignments?: number
  assessmentPending?: number
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
  const quizzes = useQuery(api.faculty.quizzes.listQuizzesByCourse, {
    courseId,
  })
  const assignments = useQuery(api.faculty.assignments.listAssignmentsByCourse, {
    courseId,
  })

  const [expandedModules, setExpandedModules] = useState<Set<Id<"modules">>>(new Set())

  const toggleModule = (moduleId: Id<"modules">) => {
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
  const stats = useMemo<ContentStats | null>(() => {
    if (!modules) return null

    const baseStats = {
      total: modules.length,
      published: modules.filter((m) => m.status === CONTENT_STATUS.PUBLISHED).length,
      pending: modules.filter((m) => m.status === CONTENT_STATUS.PENDING).length,
      totalLessons: modules.reduce((sum, m) => sum + m.lessonCount, 0),
    }

    if (!quizzes || !assignments) return baseStats

    const pendingQuizCount = quizzes.filter((q) => q.status === CONTENT_STATUS.PENDING).length
    const pendingAssignmentCount =
      assignments.filter((a) => a.status === CONTENT_STATUS.PENDING).length

    return {
      ...baseStats,
      totalQuizzes: quizzes.length,
      pendingQuizzes: pendingQuizCount,
      totalAssignments: assignments.length,
      pendingAssignments: pendingAssignmentCount,
      assessmentPending: pendingQuizCount + pendingAssignmentCount,
    }
  }, [modules, quizzes, assignments])

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

              {typeof stats.totalQuizzes !== "undefined" && stats.totalQuizzes > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <ClipboardDocumentListIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.totalQuizzes}</span>
                  <span className="text-muted-foreground">
                    {stats.totalQuizzes === 1 ? "Quiz" : "Quizzes"}
                  </span>
                </div>
              )}

              {typeof stats.totalAssignments !== "undefined" && stats.totalAssignments > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{stats.totalAssignments}</span>
                  <span className="text-muted-foreground">
                    {stats.totalAssignments === 1 ? "Assignment" : "Assignments"}
                  </span>
                </div>
              )}

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

              {typeof stats.assessmentPending !== "undefined" && stats.assessmentPending > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex cursor-help items-center gap-2 text-sm">
                        <ExclamationCircleIcon className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-destructive">{stats.assessmentPending}</span>
                        <span className="text-muted-foreground">Assessment Review</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Quizzes and assignments pending approval</p>
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

      {quizzes && quizzes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Quizzes</h3>
            <Badge variant="secondary">{quizzes.length}</Badge>
          </div>
          <div className="space-y-2 rounded-lg border">
            {quizzes.map((quiz) => (
              <QuizItem key={quiz._id} quiz={quiz} courseId={courseId} />
            ))}
          </div>
        </div>
      )}

      {assignments && assignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Assignments</h3>
            <Badge variant="secondary">{assignments.length}</Badge>
          </div>
          <div className="space-y-2 rounded-lg border">
            {assignments.map((assignment) => (
              <AssignmentItem key={assignment._id} assignment={assignment} courseId={courseId} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}