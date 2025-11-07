import { Badge } from "@/components/ui/badge"
import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
} from "@/components/ui/description-list"
import { Separator } from "@/components/ui/separator"
import {
    AcademicCapIcon,
    CalendarIcon,
    DocumentTextIcon,
    KeyIcon,
    TagIcon,
    UserIcon,
} from "@heroicons/react/24/outline"

interface CourseDetailsProps {
    courseId: string
    description: string
    content: string
    categoryName: string
    teacherName?: string
    enrollmentCode?: string
    isEnrollmentOpen: boolean
    createdAt: number
    updatedAt: number
}

export function CourseDetails({
    courseId,
    description,
    content,
    categoryName,
    teacherName,
    enrollmentCode,
    isEnrollmentOpen,
    createdAt,
    updatedAt,
}: CourseDetailsProps) {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="space-y-6">
            <DescriptionList>
                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <TagIcon className="size-4 text-muted-foreground" />
                        <span>Category</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails>
                    <Badge intent="secondary">{categoryName}</Badge>
                </DescriptionDetails>

                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <UserIcon className="size-4 text-muted-foreground" />
                        <span>Instructor</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails>
                    {teacherName ? (
                        <span className="font-medium">{teacherName}</span>
                    ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                </DescriptionDetails>

                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <DocumentTextIcon className="size-4 text-muted-foreground" />
                        <span>Description</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails className="whitespace-pre-wrap">{description}</DescriptionDetails>

                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <AcademicCapIcon className="size-4 text-muted-foreground" />
                        <span>Content</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails className="whitespace-pre-wrap">{content}</DescriptionDetails>
            </DescriptionList>

            <Separator />

            <DescriptionList>
                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <KeyIcon className="size-4 text-muted-foreground" />
                        <span>Enrollment Status</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails>
                    <Badge intent={isEnrollmentOpen ? "success" : "secondary"}>
                        {isEnrollmentOpen ? "Open" : "Closed"}
                    </Badge>
                </DescriptionDetails>

                {enrollmentCode && (
                    <>
                        <DescriptionTerm>Enrollment Code</DescriptionTerm>
                        <DescriptionDetails>
                            <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                {enrollmentCode}
                            </code>
                        </DescriptionDetails>
                    </>
                )}

                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <span>Created</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails>{formatDate(createdAt)}</DescriptionDetails>

                <DescriptionTerm>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <span>Last Updated</span>
                    </div>
                </DescriptionTerm>
                <DescriptionDetails>{formatDate(updatedAt)}</DescriptionDetails>

                <DescriptionTerm>Course ID</DescriptionTerm>
                <DescriptionDetails>
                    <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {courseId}
                    </code>
                </DescriptionDetails>
            </DescriptionList>
        </div>
    )
}
