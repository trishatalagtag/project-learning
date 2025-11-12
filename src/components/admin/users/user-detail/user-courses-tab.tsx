import { Card, CardContent } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { DocumentTextIcon } from "@heroicons/react/24/solid"

interface UserCoursesTabProps {
    userId: string
}

export function UserCoursesTab({ userId }: UserCoursesTabProps) {
    // TODO: Implement when backend query is available
    // const courses = useQuery(api.admin.users.getUserCourses, { userId })

    return (
        <Card>
            <CardContent className="py-12">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <DocumentTextIcon className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>Created Courses Coming Soon</EmptyTitle>
                        <EmptyDescription>
                            This feature will display courses created by this user once the backend is
                            implemented.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </CardContent>
        </Card>
    )
}

