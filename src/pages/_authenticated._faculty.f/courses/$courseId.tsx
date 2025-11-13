import { FacultyCourseDetailPage } from "@/components/faculty/courses/faculty-course-detail-page"
import { courseParams } from "@/hooks/use-route-params"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

const courseDetailSearchSchema = z.object({
    tab: z
        .enum(["settings", "content", "grading", "announcements", "progress", "assessments"])
        .optional(),
})

export const Route = createFileRoute("/_authenticated/_faculty/f/courses/$courseId")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
    },
    params: zodValidator(courseParams),
    validateSearch: courseDetailSearchSchema,
    component: FacultyCourseDetailPage,
})
