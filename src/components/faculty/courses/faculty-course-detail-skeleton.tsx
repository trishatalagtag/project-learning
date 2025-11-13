"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function FacultyCourseDetailSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings & Details</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

