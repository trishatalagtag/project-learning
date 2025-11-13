import { CourseCard } from "@/components/course-catalog/course-card"
import { CourseListItem } from "@/components/course-catalog/course-list-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ItemGroup } from "@/components/ui/item"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { flattenCategoryTree, normalizeCategoryTree } from "@/lib/categories"
import { cn } from "@/lib/utils"
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  FunnelIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useMemo, useState } from "react"
import { z } from "zod"

const courseSearchSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(12),
  search: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  enrollmentOpen: z.boolean().optional(),
  view: z.enum(["grid", "list"]).optional().default("grid"),
})

export const Route = createFileRoute("/_public/courses/")({
  validateSearch: courseSearchSchema,
  component: CoursesPage,
})

function CoursesPage() {
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  const offset = (searchParams.page - 1) * searchParams.limit

  const result = useQuery(api.learner.courses.listPublicCourses, {
    limit: searchParams.limit,
    offset,
    search: searchParams.search,
    categoryId: searchParams.categoryIds?.[0] as Id<"categories"> | undefined,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  })

  const categories = useQuery(api.shared.categories.listAllCategories, {})
  const normalizedCategories = useMemo(
    () => (categories ? normalizeCategoryTree(categories) : []),
    [categories],
  )
  const flatCategories = useMemo(
    () => flattenCategoryTree(normalizedCategories),
    [normalizedCategories],
  )

  const filteredCourses = useMemo(() => {
    let courses = result?.courses || []

    // Filter by enrollment status
    if (searchParams.enrollmentOpen !== undefined) {
      courses = courses.filter((course) => course.isEnrollmentOpen === searchParams.enrollmentOpen)
    }

    // Filter by multiple categories
    if (searchParams.categoryIds && searchParams.categoryIds.length > 0) {
      const categoryIds = searchParams.categoryIds as Id<"categories">[]
      courses = courses.filter((course) => categoryIds.includes(course.categoryId))
    }

    return courses
  }, [result?.courses, searchParams.enrollmentOpen, searchParams.categoryIds])

  const filteredTotal = filteredCourses?.length ?? 0

  const [localSearch, setLocalSearch] = useState(searchParams.search ?? "")

  const totalPages = useMemo(() => {
    if (!filteredTotal) return 1
    return Math.max(1, Math.ceil(filteredTotal / (searchParams.limit || 1)))
  }, [filteredTotal, searchParams.limit])

  const applySearchParam = <K extends keyof z.infer<typeof courseSearchSchema>>(
    key: K,
    value: z.infer<typeof courseSearchSchema>[K]
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value,
        ...(key !== "page" ? { page: 1 } : {}),
      }),
    })
  }

  const viewMode = searchParams.view ?? "grid"

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <section className="relative overflow-hidden bg-background">
        {/* Background Cover Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/courses-hero.jpg"
            alt="DISOA Course Catalog"
            className="size-full object-cover object-center brightness-[0.4] dark:brightness-[0.6]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-primary/30 dark:from-primary/60 dark:via-primary/40 dark:to-primary/20" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto max-w-7xl px-4 py-20 sm:py-24 md:py-28 lg:py-36">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <BookOpenIcon className="size-16 text-primary-foreground drop-shadow-sm sm:size-20 md:size-24" />
            </div>
            <h1 className="mb-4 font-bold text-3xl text-primary-foreground tracking-tight sm:text-4xl md:text-5xl dark:text-white dark:drop-shadow-md">
              Course Catalog
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90 dark:text-white/90 dark:drop-shadow-md">
              Browse all available agricultural training courses
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="container mx-auto max-w-7xl px-4 py-8">
        {/* Category Filter - Multi-Select */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <label htmlFor="category-filter" className="whitespace-nowrap font-medium text-muted-foreground text-sm">
              <FunnelIcon className="mr-1 inline h-4 w-4" />
              Categories:
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="category-filter"
                  variant="outline"
                  className="w-full justify-between sm:w-[300px]"
                >
                  <span>
                    {searchParams.categoryIds && searchParams.categoryIds.length > 0
                      ? `${searchParams.categoryIds.length} selected`
                      : "All Categories"}
                  </span>
                  <FunnelIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {categories === undefined ? (
                    <div className="flex items-center justify-center p-4">
                      <span className="text-muted-foreground text-sm">Loading...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {normalizedCategories.map((level1Cat) => (
                        <div key={level1Cat._id} className="space-y-1">
                          <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                            {level1Cat.name}
                          </div>
                          <label
                            htmlFor={`category-${level1Cat._id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                          >
                            <Checkbox
                              id={`category-${level1Cat._id}`}
                              checked={searchParams.categoryIds?.includes(level1Cat._id as unknown as string) || false}
                              onCheckedChange={(checked) => {
                                const currentIds = searchParams.categoryIds || []
                                const newIds = checked
                                  ? [...currentIds, level1Cat._id as unknown as string]
                                  : currentIds.filter((id) => id !== (level1Cat._id as unknown as string))
                                applySearchParam("categoryIds", newIds.length > 0 ? newIds : undefined)
                              }}
                            />
                            <span className="text-sm">{level1Cat.name}</span>
                          </label>
                          {level1Cat.children.map((level2Cat) => (
                            <label
                              key={level2Cat._id}
                              htmlFor={`category-${level2Cat._id}`}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 pl-6 hover:bg-accent"
                            >
                              <Checkbox
                                id={`category-${level2Cat._id}`}
                                checked={searchParams.categoryIds?.includes(level2Cat._id as unknown as string) || false}
                                onCheckedChange={(checked) => {
                                  const currentIds = searchParams.categoryIds || []
                                  const newIds = checked
                                    ? [...currentIds, level2Cat._id as unknown as string]
                                    : currentIds.filter((id) => id !== (level2Cat._id as unknown as string))
                                  applySearchParam("categoryIds", newIds.length > 0 ? newIds : undefined)
                                }}
                              />
                              <span className="text-sm">{level2Cat.name}</span>
                            </label>
                          ))}
                          {level1Cat.children.flatMap((level2Cat) =>
                            level2Cat.children.map((level3Cat) => (
                              <label
                                key={level3Cat._id}
                                htmlFor={`category-${level3Cat._id}`}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 pl-10 hover:bg-accent"
                              >
                                <Checkbox
                                  id={`category-${level3Cat._id}`}
                                  checked={searchParams.categoryIds?.includes(level3Cat._id as unknown as string) || false}
                                  onCheckedChange={(checked) => {
                                    const currentIds = searchParams.categoryIds || []
                                    const newIds = checked
                                      ? [...currentIds, level3Cat._id as unknown as string]
                                      : currentIds.filter((id) => id !== (level3Cat._id as unknown as string))
                                    applySearchParam("categoryIds", newIds.length > 0 ? newIds : undefined)
                                  }}
                                />
                                <span className="text-sm">{level3Cat.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {searchParams.categoryIds && searchParams.categoryIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {searchParams.categoryIds.slice(0, 3).map((categoryId) => {
                const selectedCategory = flatCategories.find(
                  (cat) => cat._id === (categoryId as Id<"categories">)
                )
                if (!selectedCategory) return null
                return (
                  <Badge
                    key={categoryId}
                    variant="default"
                    className="cursor-pointer gap-1"
                    onClick={() => {
                      const newIds = searchParams.categoryIds?.filter((id) => id !== categoryId) || []
                      applySearchParam("categoryIds", newIds.length > 0 ? newIds : undefined)
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {selectedCategory.name}
                    <XMarkIcon className="h-3 w-3" />
                  </Badge>
                )
              })}
              {searchParams.categoryIds.length > 3 && (
                <Badge variant="secondary" className="gap-1">
                  +{searchParams.categoryIds.length - 3} more
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySearchParam("categoryIds", undefined)}
                className="h-6 px-2 text-xs"
                aria-label="Clear all category filters"
              >
                <XMarkIcon className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Search, Filters, and View Toggle */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applySearchParam("search", localSearch || undefined)
                  }
                }}
                className="pl-9"
                aria-label="Search courses"
              />
            </div>
          </div>

          <Select
            value={`${searchParams.sortBy}:${searchParams.sortOrder}`}
            onValueChange={(v) => {
              const [sortBy, sortOrder] = v.split(":") as [
                "title" | "createdAt" | "updatedAt",
                "asc" | "desc",
              ]
              applySearchParam("sortBy", sortBy)
              applySearchParam("sortOrder", sortOrder)
            }}
          >
            <SelectTrigger aria-label="Sort courses">
              <FunnelIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest First</SelectItem>
              <SelectItem value="createdAt:asc">Oldest First</SelectItem>
              <SelectItem value="title:asc">Title A–Z</SelectItem>
              <SelectItem value="title:desc">Title Z–A</SelectItem>
              <SelectItem value="updatedAt:desc">Recently Updated</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={searchParams.enrollmentOpen ? "default" : "outline"}
            onClick={() =>
              applySearchParam("enrollmentOpen", searchParams.enrollmentOpen ? undefined : true)
            }
            aria-pressed={!!searchParams.enrollmentOpen}
            className="w-full"
          >
            <BookOpenIcon className="mr-2 h-4 w-4" />
            Open Enrollment
          </Button>

          {/* View Toggle */}
          <div className="flex gap-1 rounded-md border p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => applySearchParam("view", "grid")}
              className="flex-1"
              aria-label="Grid view"
            >
              <Squares2X2Icon className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => applySearchParam("view", "list")}
              className="flex-1"
              aria-label="List view"
            >
              <ListBulletIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mb-6 flex justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              setLocalSearch("")
              navigate({
                search: () => ({
                  page: 1,
                  limit: 12,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                  view: "grid",
                }),
              })
            }}
          >
            <XMarkIcon className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {/* Results Count */}
        {result && (
          <div className="mb-4 text-muted-foreground text-sm">
            Showing {offset + 1}–{Math.min(offset + (filteredCourses?.length || 0), filteredTotal)} of{" "}
            {filteredTotal} courses
          </div>
        )}

        {/* Course Grid/List */}
        {result === undefined ? (
          // Loading State
          <div className={cn(
            viewMode === "grid" && "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
            viewMode === "list" && "space-y-4"
          )}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredTotal === 0 ? (
          // Empty State
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AcademicCapIcon className="size-12" />
              </EmptyMedia>
              <EmptyTitle>No courses found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search or filters to find what you're looking for.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => {
                  setLocalSearch("")
                  navigate({
                    search: () => ({
                      page: 1,
                      limit: 12,
                      sortBy: "createdAt",
                      sortOrder: "desc",
                      view: "grid",
                    }),
                  })
                }}
              >
                Reset Filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses?.map((course) => (
                  <CourseCard key={course._id} course={course} showNewBadge={true} />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <ItemGroup>
                {filteredCourses?.map((course) => (
                  <CourseListItem key={course._id} course={course} />
                ))}
              </ItemGroup>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <BookOpenIcon className="h-4 w-4" />
                  <span>
                    Page {searchParams.page} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={searchParams.page <= 1}
                    onClick={() => applySearchParam("page", Math.max(1, searchParams.page - 1))}
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    {searchParams.page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={searchParams.page >= totalPages}
                    onClick={() =>
                      applySearchParam("page", Math.min(totalPages, searchParams.page + 1))
                    }
                  >
                    Next
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}