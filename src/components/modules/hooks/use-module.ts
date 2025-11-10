import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { CONTENT_STATUS } from "@/lib/constants/content-status"

export function useModule(moduleId: Id<"modules">) {
  const module = useQuery(api.faculty.modules.getModuleById, { moduleId })

  return {
    module,
    isLoading: module === undefined,
    isNotFound: module === null,
    isPublished: module?.status === CONTENT_STATUS.PUBLISHED,
    isDraft: module?.status === CONTENT_STATUS.DRAFT,
    isPending: module?.status === CONTENT_STATUS.PENDING,
  } as const
}

export function useModuleLessons(moduleId: Id<"modules">) {
  const lessons = useQuery(api.faculty.lessons.listLessonsByModule, { moduleId })

  return {
    lessons: lessons ?? [],
    isLoading: lessons === undefined,
    isEmpty: lessons?.length === 0,
    count: lessons?.length ?? 0,
  } as const
}
