import { Card, CardContent } from "@/components/ui/card"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { AcademicCapIcon } from "@heroicons/react/24/outline"

interface UserEnrollmentsTabProps {
    userId: string
}

export function UserEnrollmentsTab({ userId }: UserEnrollmentsTabProps) {
    // TODO: Implement when backend query is available
    // const enrollments = useQuery(api.admin.users.getUserEnrollments, { userId })

    return (
        <Card>
            <CardContent className="py-12">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <AcademicCapIcon className="h-12 w-12 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>Enrollments Coming Soon</EmptyTitle>
                        <EmptyDescription>
                            This feature will display the user's enrolled courses once the backend is
                            implemented.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </CardContent>
        </Card>
    )
}

