"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

export function GradingViewSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" disabled>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Submissions
                </Button>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

