import type { ReactNode } from "react"

interface CourseCatalogFiltersProps {
  children: ReactNode
}

export function CourseCatalogFilters({ children }: CourseCatalogFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {children}
    </div>
  )
}
