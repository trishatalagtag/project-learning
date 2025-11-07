import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import {
    BookOpenIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline"

interface CourseHeaderProps {
    title: string
    status: string
    enrollmentCount: number
    moduleCount: number
}

export function CourseHeader({
    title,
    status,
    enrollmentCount,
    moduleCount,
}: CourseHeaderProps) {
    const getStatusIntent = (status: string) => {
        switch (status.toLowerCase()) {
            case "published":
                return "success"
            case "approved":
                return "info"
            case "pending":
                return "warning"
            case "rejected":
                return "danger"
            default:
                return "secondary"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                    <Heading level={1} className="text-2xl sm:text-3xl">
                        {title}
                    </Heading>
                </div>
                <Badge intent={getStatusIntent(status)} className="shrink-0 text-sm">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                            <UserGroupIcon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <Text className="text-muted-foreground text-sm">Enrollments</Text>
                            <Text className="font-semibold text-2xl">{enrollmentCount}</Text>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-info/10">
                            <BookOpenIcon className="size-6 text-info" />
                        </div>
                        <div className="flex-1">
                            <Text className="text-muted-foreground text-sm">Modules</Text>
                            <Text className="font-semibold text-2xl">{moduleCount}</Text>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
