import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item"
import {
    AcademicCapIcon,
    CalendarIcon,
    ClockIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"

import type { User } from "../columns"

interface UserStatsCardProps {
    user: User
}

export function UserStatsCard({ user }: UserStatsCardProps) {
    const isFacultyOrAdmin = user.role === "FACULTY" || user.role === "ADMIN"

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <ItemGroup className="space-y-2">
                    <Item variant="outline">
                        <ItemContent>
                            <ItemTitle className="flex items-center gap-2">
                                <AcademicCapIcon className="h-4 w-4 text-muted-foreground" />
                                Enrollments
                            </ItemTitle>
                            <ItemDescription className="mt-1">
                                <span className="font-bold text-2xl">{user.enrolledCoursesCount}</span>
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    {isFacultyOrAdmin && (
                        <Item variant="outline">
                            <ItemContent>
                                <ItemTitle className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                                    Created Courses
                                </ItemTitle>
                                <ItemDescription className="mt-1">
                                    <span className="font-bold text-2xl">{user.createdCoursesCount || 0}</span>
                                </ItemDescription>
                            </ItemContent>
                        </Item>
                    )}

                    <Item variant="outline">
                        <ItemContent>
                            <ItemTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                Member Since
                            </ItemTitle>
                            <ItemDescription className="mt-1">
                                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                <br />
                                <span className="text-muted-foreground text-xs">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </ItemDescription>
                        </ItemContent>
                    </Item>

                    <Item variant="outline">
                        <ItemContent>
                            <ItemTitle className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                Last Updated
                            </ItemTitle>
                            <ItemDescription className="mt-1">
                                {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                                <br />
                                <span className="text-muted-foreground text-xs">
                                    {new Date(user.updatedAt).toLocaleDateString()}
                                </span>
                            </ItemDescription>
                        </ItemContent>
                    </Item>
                </ItemGroup>
            </CardContent>
        </Card>
    )
}

