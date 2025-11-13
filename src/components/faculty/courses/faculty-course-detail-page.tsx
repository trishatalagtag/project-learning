"use client"

import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ExclamationCircleIcon } from "@heroicons/react/24/solid"
import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { ArrowLeftIcon } from "lucide-react"
import { FacultyCourseDetailSkeleton } from "./faculty-course-detail-skeleton"
import { FacultyAnnouncementsTab } from "./tabs/announcements-tab"
import { FacultyAssessmentsTab } from "./tabs/assessments-tab"
import { FacultyCourseContentTab } from "./tabs/faculty-course-content-tab"
import { FacultyCourseSettingsTab } from "./tabs/faculty-course-settings-tab"
import { FacultyProgressTab } from "./tabs/progress-tab"

export function FacultyCourseDetailPage() {
    const navigate = useNavigate()
    const { courseId } = useParams({ from: "/_authenticated/_faculty/f/courses/$courseId" })
    const search = useSearch({ from: "/_authenticated/_faculty/f/courses/$courseId" }) as {
        tab?: "settings" | "content" | "announcements" | "progress" | "assessments"
    }

    // Fetch course data using faculty API
    const course = useQuery(api.faculty.courses.getCourseById, {
        courseId: courseId as Id<"courses">,
    })

    if (course === undefined) {
        return <FacultyCourseDetailSkeleton />
    }

    // Error state - Convex returns null when query fails
    if (course === null) {
        return (
            <div>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>Failed to load course</EmptyTitle>
                        <EmptyDescription>
                            An error occurred while fetching the course data. Please try again.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                        <Button variant="outline" onClick={() => navigate({ to: "/f" })}>
                            Back to Dashboard
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    // Not found state - course doesn't exist
    if (!course) {
        return (
            <div>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
                        </EmptyMedia>
                        <EmptyTitle>Course not found</EmptyTitle>
                        <EmptyDescription>The course you're looking for doesn't exist.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => navigate({ to: "/f" })}>Back to Dashboard</Button>
                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/f" })}>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="font-bold text-3xl tracking-tight">{course.title}</h1>
                        <p className="text-muted-foreground">{course.categoryName}</p>
                    </div>
                </div>
            </div>

            {/* Tabbed Interface */}
            <Tabs
                defaultValue={search.tab || "settings"}
                value={search.tab || "settings"}
                onValueChange={(value) => {
                    navigate({
                        to: "/f/courses/$courseId",
                        params: { courseId },
                        search: { tab: value as "settings" | "content" | "announcements" | "progress" | "assessments" | undefined },
                        replace: true,
                    })
                }}
                className="space-y-2"
            >
                <TabsList>
                    <TabsTrigger value="settings">Settings & Details</TabsTrigger>
                    <TabsTrigger value="content">Course Content</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                    {course && <FacultyCourseSettingsTab course={course} />}
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                    <FacultyCourseContentTab courseId={courseId as Id<"courses">} />
                </TabsContent>

                <TabsContent value="assessments" className="space-y-4">
                    <FacultyAssessmentsTab courseId={courseId as Id<"courses">} />
                </TabsContent>

                <TabsContent value="announcements" className="space-y-4">
                    <FacultyAnnouncementsTab courseId={courseId as Id<"courses">} />
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                    <FacultyProgressTab courseId={courseId as Id<"courses">} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

