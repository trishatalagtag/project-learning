import { useCourseCatalog } from "./course-catalog"

import { CourseCatalogCard } from "./course-catalog-card"
import { CourseCatalogEmpty } from "./course-catalog-empty"
import { CourseCatalogSkeleton } from "./course-catalog-skeleton"

export function CourseCatalogGrid() {
  const { courses, isLoading } = useCourseCatalog()

  if (isLoading) {
    return <CourseCatalogSkeleton />
  }

  if (!courses || courses.length === 0) {
    return <CourseCatalogEmpty />
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCatalogCard key={course._id} course={course} />
      ))}
    </div>
  )
}
