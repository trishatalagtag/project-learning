import { Note } from "@/components/ui/note"

import { useCourseCatalog } from "./course-catalog"

export function CourseCatalogEmpty() {
  const { filters } = useCourseCatalog()

  const hasActiveFilters = filters.search || filters.categoryId

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Note intent="default" className="max-w-md">
        {hasActiveFilters ? (
          <>
            <strong>No courses found</strong>
            <p className="mt-1 text-sm">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </>
        ) : (
          <>
            <strong>No courses available</strong>
            <p className="mt-1 text-sm">Check back later for new courses.</p>
          </>
        )}
      </Note>
    </div>
  )
}
