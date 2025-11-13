"use client"

import { FacultyCourseCard } from "@/components/faculty/courses/faculty-course-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { AcademicCapIcon, PlusIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounce } from "@uidotdev/usehooks"
import { useQuery } from "convex/react"
import { useMemo, useState } from "react"
import { z } from "zod"

const coursesSearchSchema = z.object({
    status: z.enum(["all", "draft", "pending", "approved", "published", "archived"]).optional(),
    search: z.string().optional(),
    sortBy: z.enum(["title", "createdAt", "updatedAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    pageIndex: z.number().optional(),
    pageSize: z.number().optional(),
})

export const Route = createFileRoute("/_authenticated/_faculty/f/courses/")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "My Courses",
        }
    },
    validateSearch: coursesSearchSchema,
    component: FacultyCoursesPage,
})

type CoursesSearch = z.infer<typeof coursesSearchSchema>

function FacultyCoursesPage() {
    const navigate = useNavigate()
    const searchParams = useSearch({ from: "/_authenticated/_faculty/f/courses/" }) as Partial<CoursesSearch>

    const {
        status = "all",
        search: searchQuery = "",
        sortBy = "updatedAt",
        sortOrder = "desc",
        pageIndex = 0,
        pageSize = 12,
    } = searchParams

    const [localSearch, setLocalSearch] = useState(searchQuery)
    const debouncedSearch = useDebounce(localSearch, 300)

    // Sync debounced search with URL
    useMemo(() => {
        if (debouncedSearch !== searchQuery) {
            navigate({
                to: "/f/courses",
                search: {
                    ...searchParams,
                    search: debouncedSearch || undefined,
                    pageIndex: 0,
                },
                replace: true,
            })
        }
    }, [debouncedSearch, searchQuery, navigate, searchParams])

    const coursesData = useQuery(api.faculty.courses.getMyCourses, {
        limit: pageSize,
        offset: pageIndex * pageSize,
        sortBy,
        sortOrder,
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
    })

    const updateSearchParam = <K extends keyof CoursesSearch>(
        key: K,
        value: CoursesSearch[K]
    ) => {
        navigate({
            to: "/f/courses",
            search: {
                ...searchParams,
                [key]: value,
                ...(key !== "pageIndex" ? { pageIndex: 0 } : {}),
            },
            replace: true,
        })
    }

    const isLoading = coursesData === undefined
    const hasError = coursesData === null
    const courses = coursesData?.courses ?? []
    const total = coursesData?.total ?? 0
    const totalPages = Math.ceil(total / pageSize)

    if (hasError) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <div>
                    <h1 className="font-bold text-3xl tracking-tight">My Courses</h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage and organize your courses
                    </p>
                </div>
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <AcademicCapIcon className="h-12 w-12 text-destructive" />
                                </EmptyMedia>
                                <EmptyTitle>Failed to load courses</EmptyTitle>
                                <EmptyDescription>
                                    An error occurred while fetching your courses. Please try again.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => window.location.reload()}>Retry</Button>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-3xl tracking-tight">My Courses</h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage and organize your courses
                    </p>
                </div>
                <Button asChild>
                    <Link to="/f/courses/new">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create New Course
                    </Link>
                </Button>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <Input
                                placeholder="Search courses..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Select
                            value={status}
                            onValueChange={(value) =>
                                updateSearchParam("status", value as CoursesSearch["status"])
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={sortBy}
                            onValueChange={(value) =>
                                updateSearchParam("sortBy", value as CoursesSearch["sortBy"])
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="createdAt">Created Date</SelectItem>
                                <SelectItem value="updatedAt">Updated Date</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={sortOrder}
                            onValueChange={(value) =>
                                updateSearchParam("sortOrder", value as CoursesSearch["sortOrder"])
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Grid */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="flex h-full flex-col">
                            <Skeleton className="aspect-video w-full rounded-t-lg" />
                            <CardContent className="space-y-2 p-6">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <AcademicCapIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No courses found</EmptyTitle>
                                <EmptyDescription>
                                    {debouncedSearch || status !== "all"
                                        ? "Try adjusting your filters or search terms."
                                        : "Get started by creating your first course."}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                {!debouncedSearch && status === "all" && (
                                    <Button asChild>
                                        <Link to="/f/courses/new">
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Create New Course
                                        </Link>
                                    </Button>
                                )}
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <FacultyCourseCard key={course._id} course={course} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground text-sm">
                                Showing {pageIndex * pageSize + 1} to{" "}
                                {Math.min((pageIndex + 1) * pageSize, total)} of {total} courses
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSearchParam("pageIndex", Math.max(0, pageIndex - 1))}
                                    disabled={pageIndex === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        updateSearchParam("pageIndex", Math.min(totalPages - 1, pageIndex + 1))
                                    }
                                    disabled={pageIndex >= totalPages - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
