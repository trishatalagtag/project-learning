"use client"

import { AnnouncementCard } from "@/components/faculty/courses/announcements/announcement-card"
import { CreateAnnouncementDialog } from "@/components/faculty/courses/announcements/create-announcement-dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { ExclamationCircleIcon, MegaphoneIcon } from "@heroicons/react/24/solid"
import { useQuery } from "convex/react"

interface FacultyAnnouncementsTabProps {
    courseId: Id<"courses">
}

export function FacultyAnnouncementsTab({ courseId }: FacultyAnnouncementsTabProps) {
    const announcements = useQuery(api.faculty.announcements.listAnnouncements, {
        courseId,
    })

    const isLoading = announcements === undefined
    const hasError = announcements === null
    const announcementsList = announcements ?? []

    if (hasError) {
        return (
            <Card>
                <CardContent className="py-12">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ExclamationCircleIcon className="h-12 w-12 text-destructive" />
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
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold text-xl">Announcements</h2>
                    <p className="text-muted-foreground text-sm">
                        Communicate with learners enrolled in this course
                    </p>
                </div>
                <CreateAnnouncementDialog courseId={courseId} />
            </div>

            {/* Loading State */}
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
            ) : announcementsList.length === 0 ? (
                /* Empty State */
                <Card>
                    <CardContent className="py-12">
                        <Empty>
                            <EmptyMedia>
                                <MegaphoneIcon className="h-12 w-12" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle>No announcements yet</EmptyTitle>
                                <EmptyDescription>
                                    No announcements have been posted for this course yet. Create one
                                    to get started.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <CreateAnnouncementDialog courseId={courseId} />
                            </EmptyContent>
                        </Empty>
                    </CardContent>
                </Card>
            ) : (
                /* Announcements List */
                <div className="space-y-4">
                    {announcementsList.map((announcement) => (
                        <AnnouncementCard
                            key={announcement._id}
                            announcement={announcement}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

