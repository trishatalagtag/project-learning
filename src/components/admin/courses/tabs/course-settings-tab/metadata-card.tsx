"use client"

import { format, formatDistanceToNow } from "date-fns"

import type { Course } from "@/lib/types/course"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item"

interface MetadataCardProps {
  course: Course
}

export function MetadataCard({ course }: MetadataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Information</CardTitle>
        <CardDescription>Read-only metadata</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="space-y-2">
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Created</ItemTitle>
              <ItemDescription>
                {formatDistanceToNow(new Date(course.createdAt), {
                  addSuffix: true,
                })}
                <br />
                <span className="text-xs">{format(new Date(course.createdAt), "PPP")}</span>
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Last Updated</ItemTitle>
              <ItemDescription>
                {formatDistanceToNow(new Date(course.updatedAt), {
                  addSuffix: true,
                })}
                <br />
                <span className="text-xs">{format(new Date(course.updatedAt), "PPP")}</span>
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Modules</ItemTitle>
              <ItemDescription>
                <span className="text-2xl font-bold">{course.moduleCount}</span>
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Enrollments</ItemTitle>
              <ItemDescription>
                <span className="text-2xl font-bold">{course.enrollmentCount}</span>
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
