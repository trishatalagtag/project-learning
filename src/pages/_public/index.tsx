import { createFileRoute } from "@tanstack/react-router"
import { api } from "api"
import type { Id } from "convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { z } from "zod"

const courseSearchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  enrollmentOpen: z.boolean().optional(),
})

export const Route = createFileRoute("/_public/")({
  validateSearch: courseSearchSchema,

  component: RouteComponent,
})

function RouteComponent() {
  const searchParams = Route.useSearch()

  const _navigate = Route.useNavigate()

  const offset = (searchParams.page - 1) * searchParams.limit

  const result = useQuery(api.learner.courses.listPublicCourses, {
    limit: searchParams.limit,
    offset,
    search: searchParams.search,
    categoryId: searchParams.categoryId as Id<"categories"> | undefined,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  })

  const filteredCourses =
    result?.courses && searchParams.enrollmentOpen !== undefined
      ? result.courses.filter((course) => course.isEnrollmentOpen === searchParams.enrollmentOpen)
      : result?.courses

  const filteredTotal =
    searchParams.enrollmentOpen !== undefined
      ? (filteredCourses?.length ?? 0)
      : (result?.total ?? 0)

  if (result === undefined) {
    return <div>Loading...</div>
  }

  return (
    <pre>
      {JSON.stringify(
        {
          result,
          filteredCourses,
          filteredTotal,
          searchParams,
        },
        null,
        2
      )}
    </pre>
  )
}
