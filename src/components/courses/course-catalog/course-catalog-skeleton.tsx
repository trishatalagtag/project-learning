import { Card, CardFooter, CardHeader } from "@/components/ui/card"

import { Skeleton } from "@/components/ui/skeleton"

export function CourseCatalogSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
