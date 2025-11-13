import { AssignmentEditorPage } from "@/components/faculty/courses/assignments/assignment-editor-page"
import { courseParams } from "@/hooks/use-route-params"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

const assignmentParams = z.object({
    assignmentId: z.string().transform((val) => val as `${"j" | "k"}${string}`),
})

export const Route = createFileRoute("/_authenticated/_admin/a/courses/$courseId/assignments/$assignmentId")({
    params: zodValidator(courseParams.merge(assignmentParams)),
    component: AssignmentEditorPage,
})
