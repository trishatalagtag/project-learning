import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { api } from "@/convex/_generated/api"
import {
    AcademicCapIcon,
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    FolderIcon,
    UsersIcon,
} from "@heroicons/react/24/solid"
import { Link } from "@tanstack/react-router"
import type { FunctionReturnType } from "convex/server"

interface DashboardAllMetricsProps {
    stats: FunctionReturnType<typeof api.admin.analytics.getSystemStats>
}

interface MetricCardProps {
    title: string
    value: number
    description?: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    color: "primary" | "blue" | "purple" | "orange" | "green" | "yellow" | "red"
}

function MetricCard({ title, value, description, icon: Icon, href, color }: MetricCardProps) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        blue: "bg-blue-500/10 text-blue-500",
        purple: "bg-purple-500/10 text-purple-500",
        orange: "bg-orange-500/10 text-orange-500",
        green: "bg-green-500/10 text-green-500",
        yellow: "bg-yellow-500/10 text-yellow-600",
        red: "bg-red-500/10 text-red-600",
    }

    return (
        <Link to={href} className="block">
            <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="font-medium text-sm">{title}</CardTitle>
                    <div className={`rounded-full p-2 ${colorClasses[color]}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="font-bold text-2xl">{value.toLocaleString()}</div>
                    {description && (
                        <p className="mt-1 text-muted-foreground text-xs">{description}</p>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}

export function DashboardAllMetrics({ stats }: DashboardAllMetricsProps) {
    return (
        <div className="space-y-8">
            {/* User Metrics Group */}
            <section>
                <h2 className="mb-4 font-semibold text-lg">User Metrics</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Total Users"
                        value={stats.totalUsers}
                        description={`${stats.totalLearners} learners, ${stats.totalFaculty} faculty, ${stats.totalAdmins} admins`}
                        icon={UsersIcon}
                        href="/a/users"
                        color="primary"
                    />
                    <Link to="/a/users" search={{ role: "LEARNER" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Learners</CardTitle>
                                <div className="rounded-full bg-blue-500/10 p-2">
                                    <UsersIcon className="h-4 w-4 text-blue-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalLearners.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Active learners on platform</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/a/users" search={{ role: "FACULTY" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Faculty</CardTitle>
                                <div className="rounded-full bg-purple-500/10 p-2">
                                    <UsersIcon className="h-4 w-4 text-purple-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalFaculty.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Course instructors</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/a/users" search={{ role: "ADMIN" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Admins</CardTitle>
                                <div className="rounded-full bg-orange-500/10 p-2">
                                    <UsersIcon className="h-4 w-4 text-orange-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalAdmins.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Platform administrators</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* Course Metrics Group */}
            <section>
                <h2 className="mb-4 font-semibold text-lg">Course Metrics</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard
                        title="Total Courses"
                        value={stats.totalCourses}
                        description={`${stats.publishedCourses} published, ${stats.pendingCourses} pending`}
                        icon={AcademicCapIcon}
                        href="/a/courses"
                        color="blue"
                    />
                    <Link to="/a/courses" search={{ status: "published" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Published Courses</CardTitle>
                                <div className="rounded-full bg-green-500/10 p-2">
                                    <AcademicCapIcon className="h-4 w-4 text-green-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.publishedCourses.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Available to learners</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/a/courses" search={{ status: "pending" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Pending Review</CardTitle>
                                <div className="rounded-full bg-yellow-500/10 p-2">
                                    <AcademicCapIcon className="h-4 w-4 text-yellow-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.pendingCourses.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Awaiting approval</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* Enrollment Metrics Group */}
            <section>
                <h2 className="mb-4 font-semibold text-lg">Enrollment Metrics</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard
                        title="Total Enrollments"
                        value={stats.totalEnrollments}
                        description={`${stats.activeEnrollments} active, ${stats.completedEnrollments} completed`}
                        icon={BookOpenIcon}
                        href="/a/analytics"
                        color="primary"
                    />
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-medium text-sm">Active Enrollments</CardTitle>
                            <div className="rounded-full bg-blue-500/10 p-2">
                                <BookOpenIcon className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">{stats.activeEnrollments.toLocaleString()}</div>
                            <p className="mt-1 text-muted-foreground text-xs">
                                {((stats.activeEnrollments / stats.totalEnrollments) * 100).toFixed(1)}% of total
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="font-medium text-sm">Completed Enrollments</CardTitle>
                            <div className="rounded-full bg-green-500/10 p-2">
                                <BookOpenIcon className="h-4 w-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-2xl">{stats.completedEnrollments.toLocaleString()}</div>
                            <p className="mt-1 text-muted-foreground text-xs">
                                {((stats.completedEnrollments / stats.totalEnrollments) * 100).toFixed(1)}% completion rate
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Content Metrics Group */}
            <section>
                <h2 className="mb-4 font-semibold text-lg">Content Metrics</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link to="/a/content" search={{ contentType: "module" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Modules</CardTitle>
                                <div className="rounded-full bg-primary/10 p-2">
                                    <FolderIcon className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalModules.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Course modules</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/a/content" search={{ contentType: "lesson" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Lessons</CardTitle>
                                <div className="rounded-full bg-blue-500/10 p-2">
                                    <BookOpenIcon className="h-4 w-4 text-blue-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalLessons.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Learning content</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/a/content" search={{ contentType: "quiz" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Quizzes</CardTitle>
                                <div className="rounded-full bg-purple-500/10 p-2">
                                    <ClipboardDocumentListIcon className="h-4 w-4 text-purple-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalQuizzes.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Assessment items</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/a/content" search={{ contentType: "assignment" }} className="block">
                        <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="font-medium text-sm">Assignments</CardTitle>
                                <div className="rounded-full bg-orange-500/10 p-2">
                                    <DocumentTextIcon className="h-4 w-4 text-orange-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{stats.totalAssignments.toLocaleString()}</div>
                                <p className="mt-1 text-muted-foreground text-xs">Student tasks</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export function DashboardAllMetricsSkeleton() {
    return (
        <div className="space-y-8">
            {[1, 2, 3, 4].map((section) => (
                <section key={section}>
                    <Skeleton className="mb-4 h-6 w-40" />
                    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${section === 2 ? "3" : section === 3 ? "3" : "4"}`}>
                        {Array.from({ length: section === 1 ? 4 : section === 2 ? 3 : section === 3 ? 3 : 4 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-[150px] w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
