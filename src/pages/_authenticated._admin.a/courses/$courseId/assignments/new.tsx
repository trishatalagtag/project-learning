import { CreateAssignmentPage } from "@/components/faculty/courses/assignments/create-assignment-page"
import { courseParams } from "@/hooks/use-route-params"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_authenticated/_admin/a/courses/$courseId/assignments/new")({
    params: zodValidator(courseParams),
    component: CreateAssignmentPage,
})
