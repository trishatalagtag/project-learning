import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftIcon } from "lucide-react"

export function CourseDetailSkeleton() {
    return (
        <div>
            {/* Header Skeleton */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" disabled>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <Skeleton className="mb-2 h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <Tabs defaultValue="settings" className="space-y-2">
                <TabsList>
                    <TabsTrigger value="settings" disabled>
                        Settings & Details
                    </TabsTrigger>
                    <TabsTrigger value="content" disabled>
                        Course Content
                    </TabsTrigger>
                    <TabsTrigger value="grading" disabled>
                        Grading Configuration
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Left Column - 2/3 width */}
                        <div className="space-y-4 lg:col-span-2">
                            {/* Course Info Card Skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-32" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-48" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="rounded-lg border p-4">
                                                <Skeleton className="mb-2 h-4 w-24" />
                                                <Skeleton className="h-5 w-full" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cover Image Card Skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-32" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-48" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-48 w-full rounded-lg" />
                                </CardContent>
                            </Card>

                            {/* Enrollment Settings Card Skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-40" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-56" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Array.from({ length: 2 }).map((_, i) => (
                                            <div key={i} className="rounded-lg border p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <Skeleton className="mb-1 h-4 w-32" />
                                                        <Skeleton className="h-3 w-48" />
                                                    </div>
                                                    <Skeleton className="h-6 w-12" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Faculty Assignment Card Skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-36" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-52" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <Skeleton className="mb-1 h-4 w-28" />
                                                <Skeleton className="h-3 w-36" />
                                            </div>
                                            <Skeleton className="h-9 w-32" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - 1/3 width */}
                        <div className="space-y-4">
                            {/* Metadata Card Skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-36" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-32" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="rounded-lg border p-4">
                                                <Skeleton className="mb-2 h-4 w-24" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Lifecycle Card Skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-32" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-48" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Skeleton className="h-20 w-full rounded-lg" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-9 flex-1" />
                                            <Skeleton className="h-9 flex-1" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Danger Zone Card Skeleton */}
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle>
                                        <Skeleton className="h-5 w-24" />
                                    </CardTitle>
                                    <CardDescription>
                                        <Skeleton className="h-4 w-40" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-9 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
