import { Card, CardContent } from "@/components/ui/card"
import {
    AcademicCapIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    UserIcon,
    UsersIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid"

interface UserStatsCardsProps {
    stats: {
        total: number
        learners: number
        faculty: number
        admins: number
        active: number
        deactivated: number
    }
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Total Users */}
            <Card>
                <CardContent >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <UsersIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm">Total Users</p>
                            <p className="font-bold text-2xl">{stats.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Learners */}
            <Card>
                <CardContent >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent">
                            <UserIcon className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm">Learners</p>
                            <p className="font-bold text-2xl">{stats.learners}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Faculty */}
            <Card>
                <CardContent >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
                            <AcademicCapIcon className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm">Faculty</p>
                            <p className="font-bold text-2xl">{stats.faculty}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admins */}
            <Card>
                <CardContent >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <ShieldCheckIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm">Admins</p>
                            <p className="font-bold text-2xl">{stats.admins}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active */}
            <Card>
                <CardContent >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <CheckCircleIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm">Active</p>
                            <p className="font-bold text-2xl">{stats.active}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deactivated */}
            <Card>
                <CardContent >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                            <XCircleIcon className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground text-sm">Deactivated</p>
                            <p className="font-bold text-2xl">{stats.deactivated}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

