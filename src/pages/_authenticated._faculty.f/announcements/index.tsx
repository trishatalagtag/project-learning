"use client"

import { AnnouncementCard } from "@/components/faculty/courses/announcements/announcement-card"
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
import { MegaphoneIcon, PlusIcon } from "@heroicons/react/24/solid"
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { useMemo, useState } from "react"

export const Route = createFileRoute("/_authenticated/_faculty/f/announcements/")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Announcements",
        }
    },
    component: FacultyAnnouncementsPage,
})

function FacultyAnnouncementsPage() {
    const { auth } = useRouteContext({ strict: false })
    const _userId = auth?.session?.user?.id

    const [search, setSearch] = useState("")
    const [courseFilter, setCourseFilter] = useState<string>("all")

    // Get all courses for this faculty member
    const myCourses = useQuery(api.faculty.courses.getMyCourses, {
        limit: 1000,
        offset: 0,
    })

    // For now, show a message directing users to course-specific announcements
    // A proper implementation would require fetching announcements for each course
    // which is complex with React hooks rules. Users can view announcements
    // from the course detail page instead.
    const allAnnouncements: Array<{
        _id: string
        _creationTime: number
        courseId?: string
        authorId: string
        authorName: string
        title: string
        content: string
        isPinned: boolean
        createdAt: number
        updatedAt: number
        courseTitle: string
    }> = []

    const filteredAnnouncements = useMemo(() => {
        return allAnnouncements.filter((announcement) => {
            const matchesSearch =
                search.trim().length === 0 ||
                announcement.title.toLowerCase().includes(search.toLowerCase()) ||
                announcement.content.toLowerCase().includes(search.toLowerCase()) ||
                announcement.courseTitle.toLowerCase().includes(search.toLowerCase())

            const matchesCourse =
                courseFilter === "all" || announcement.courseId === courseFilter

            return matchesSearch && matchesCourse
        })
    }, [allAnnouncements, search, courseFilter])

    const isLoading = myCourses === undefined
    const hasError = myCourses === null

    if (hasError) {
        return (
            <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <MegaphoneIcon className="h-12 w-12 text-destructive" />
                                </EmptyMedia>
                                <EmptyTitle>Failed to load announcements</EmptyTitle>
                                <EmptyDescription>
                                    An error occurred while fetching announcements. Please try again.
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
                    <h1 className="font-bold text-3xl tracking-tight">Announcements</h1>
                    <p className="mt-2 text-muted-foreground">
                        View and manage announcements across all your courses
                    </p>
                </div>
                <Button asChild>
                    <Link to="/f/announcements/new">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Announcement
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <Input
                                placeholder="Search announcements..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Select value={courseFilter} onValueChange={setCourseFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {myCourses?.courses.map((course) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Announcements List */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <MegaphoneIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No announcements found</EmptyTitle>
                                <EmptyDescription>
                                    {search || courseFilter !== "all"
                                        ? "No announcements match your filters."
                                        : "You haven't created any announcements yet."}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                {!search && courseFilter === "all" && (
                                    <Button asChild>
                                        <Link to="/f/announcements/new">
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Create Announcement
                                        </Link>
                                    </Button>
                                )}
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            ) : myCourses?.courses && myCourses.courses.length > 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <MegaphoneIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>View Course Announcements</EmptyTitle>
                                <EmptyDescription>
                                    To view and manage announcements, please navigate to a specific course and use the Announcements tab.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button asChild>
                                        <Link to="/f/courses">View My Courses</Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link to="/f/announcements/new">Create Announcement</Link>
                                    </Button>
                                </div>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <MegaphoneIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No courses available</EmptyTitle>
                                <EmptyDescription>
                                    You need to have at least one course to create announcements.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button asChild>
                                    <Link to="/f/courses/new">Create Your First Course</Link>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
