"use client"

import { DeleteAnnouncementDialog } from "@/components/faculty/courses/announcements/delete-announcement-dialog"
import { EditAnnouncementDialog } from "@/components/faculty/courses/announcements/edit-announcement-dialog"
import { MarkdownViewer } from "@/components/shared/content/viewer/markdown-viewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { PaperClipIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

type Announcement = FunctionReturnType<typeof api.faculty.announcements.listAnnouncements>[number]

interface AnnouncementCardProps {
    announcement: Announcement
    courseId?: Id<"courses">
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const pinAnnouncement = useMutation(api.faculty.announcements.pinAnnouncement)

    const handlePinToggle = async () => {
        try {
            await pinAnnouncement({
                announcementId: announcement._id,
                isPinned: !announcement.isPinned,
            })
            toast.success(
                announcement.isPinned
                    ? "Announcement unpinned"
                    : "Announcement pinned to top"
            )
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update pin status"
            toast.error(message)
        }
    }

    const formattedDate = format(new Date(announcement.createdAt), "MMM d, yyyy 'at' h:mm a")

    return (
        <>
            <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                                {announcement.isPinned && (
                                    <Badge variant="default" className="gap-1">
                                        <PaperClipIcon className="h-3 w-3" />
                                        Pinned
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                                <span>By {announcement.authorName}</span>
                                <span>•</span>
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handlePinToggle}
                                            className="h-8 w-8 p-0"
                                            aria-label={
                                                announcement.isPinned
                                                    ? "Unpin announcement"
                                                    : "Pin announcement"
                                            }
                                        >
                                            <PaperClipIcon
                                                className={`h-4 w-4 ${announcement.isPinned
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                                    }`}
                                            />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {announcement.isPinned
                                            ? "Unpin announcement"
                                            : "Pin announcement"}
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="h-8 w-8 p-0"
                                            aria-label="Edit announcement"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit announcement</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsDeleting(true)}
                                            className="h-8 w-8 p-0 text-destructive"
                                            aria-label="Delete announcement"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete announcement</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownViewer markdown={announcement.content} />
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            {isEditing && (
                <EditAnnouncementDialog
                    open={isEditing}
                    onOpenChange={setIsEditing}
                    announcement={announcement}
                />
            )}

            {/* Delete Dialog */}
            {isDeleting && (
                <DeleteAnnouncementDialog
                    open={isDeleting}
                    onOpenChange={setIsDeleting}
                    announcement={announcement}
                />
            )}
        </>
    )
}

