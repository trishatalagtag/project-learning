"use client"

import { api } from "@/convex/_generated/api"
import type { Course } from "@/lib/types/course"
import { useQuery } from "convex/react"
import { CoverImageUpload } from "../../cover-image-upload"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CoverImageCardProps {
  course: Course
}

export function CoverImageCard({ course }: CoverImageCardProps) {
  const coverImageUrl = course.coverImageId
    ? useQuery(api.shared.files.getFileUrl, {
        fileId: course.coverImageId,
      })
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cover Image</CardTitle>
        <CardDescription>Upload a cover image for this course</CardDescription>
      </CardHeader>
      <CardContent>
        <CoverImageUpload courseId={course._id} currentImageUrl={coverImageUrl || undefined} />
      </CardContent>
    </Card>
  )
}
