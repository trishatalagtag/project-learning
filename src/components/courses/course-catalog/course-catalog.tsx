import type { api } from "api"

import type { FunctionReturnType } from "convex/server"
import { createContext, type ReactNode, useContext } from "react"

type Course = FunctionReturnType<typeof api.learner.courses.listPublicCourses>["courses"][number]

type SortBy = "title" | "createdAt" | "updatedAt"

type SortOrder = "asc" | "desc"

export interface CourseCatalogFilters {
  page: number
  limit: number
  search?: string
  categoryId?: string
  sortBy: SortBy
  sortOrder: SortOrder
  enrollmentOpen?: boolean
}

interface CourseCatalogContextValue {
  courses?: Course[]
  total: number
  isLoading: boolean
  filters: CourseCatalogFilters
  onFiltersChange: (filters: Partial<CourseCatalogFilters>) => void
}

const CourseCatalogContext = createContext<CourseCatalogContextValue | null>(null)

export function useCourseCatalog() {
  const context = useContext(CourseCatalogContext)
  if (!context) {
    throw new Error("CourseCatalog components must be wrapped in <CourseCatalog />")
  }
  return context
}

interface CourseCatalogProps {
  children: ReactNode
  courses?: Course[]
  total?: number
  isLoading?: boolean
  filters: CourseCatalogFilters
  onFiltersChange: (filters: Partial<CourseCatalogFilters>) => void
}

export function CourseCatalog({
  children,
  courses,
  total = 0,
  isLoading = false,
  filters,
  onFiltersChange,
}: CourseCatalogProps) {
  return (
    <CourseCatalogContext.Provider
      value={{
        courses,
        total,
        isLoading,
        filters,
        onFiltersChange,
      }}
    >
      <div className="space-y-6">{children}</div>
    </CourseCatalogContext.Provider>
  )
}
