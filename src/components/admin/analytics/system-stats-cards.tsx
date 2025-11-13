import { Card, CardContent } from "@/components/ui/card";
import type { api } from "@/convex/_generated/api";
import {
    AcademicCapIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    UsersIcon,
} from "@heroicons/react/24/solid";
import type { FunctionReturnType } from "convex/server";

interface SystemStatsCardsProps {
    stats: FunctionReturnType<typeof api.admin.analytics.getSystemStats>;
}

export function SystemStatsCards({ stats }: SystemStatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Total Users */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <UsersIcon className="size-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-muted-foreground text-sm">
                                Total Users
                            </p>
                            <p className="font-bold text-2xl">{stats.totalUsers}</p>
                            <div className="mt-1 flex gap-3 text-muted-foreground text-xs">
                                <span>Learners: {stats.totalLearners}</span>
                                <span className="text-muted-foreground text-xs">Faculty: {stats.totalFaculty}</span>
                                <span className="text-muted-foreground text-xs">Admins: {stats.totalAdmins}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Courses */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-500/10 p-3">
                            <AcademicCapIcon className="size-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-muted-foreground text-sm">
                                Total Courses
                            </p>
                            <p className="font-bold text-2xl">{stats.totalCourses}</p>
                            <div className="mt-1 flex gap-3 text-muted-foreground text-xs">
                                <span>Published: {stats.publishedCourses}</span>
                                <span>Pending: {stats.pendingCourses}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Enrollments */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-500/10 p-3">
                            <CheckCircleIcon className="size-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-muted-foreground text-sm">
                                Total Enrollments
                            </p>
                            <p className="font-bold text-2xl">{stats.totalEnrollments}</p>
                            <div className="mt-1 flex gap-3 text-muted-foreground text-xs">
                                <span>Active: {stats.activeEnrollments}</span>
                                <span>Completed: {stats.completedEnrollments}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Overview */}
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-purple-500/10 p-3">
                            <DocumentTextIcon className="size-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-muted-foreground text-sm">
                                Content Items
                            </p>
                            <p className="font-bold text-2xl">
                                {stats.totalModules +
                                    stats.totalLessons +
                                    stats.totalQuizzes +
                                    stats.totalAssignments}
                            </p>
                            <div className="mt-1 grid grid-cols-2 gap-x-2 text-muted-foreground text-xs">
                                <span>Modules: {stats.totalModules}</span>
                                <span>Lessons: {stats.totalLessons}</span>
                                <span>Quizzes: {stats.totalQuizzes}</span>
                                <span>Assignments: {stats.totalAssignments}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
