"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

export function LearnerProgressDetailSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" disabled>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back to Progress
                </Button>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>

            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

