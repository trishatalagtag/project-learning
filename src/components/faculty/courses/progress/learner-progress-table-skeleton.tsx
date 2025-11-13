"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function LearnerProgressTableSkeleton() {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">
                                    <Skeleton className="h-4 w-32" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-24" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-32" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-28" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-32" />
                                </TableHead>
                                <TableHead>
                                    <Skeleton className="h-4 w-28" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

