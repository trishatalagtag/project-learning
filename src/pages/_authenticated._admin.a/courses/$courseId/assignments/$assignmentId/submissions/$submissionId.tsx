import { GradingView } from "@/components/faculty/courses/assignments/grading-view"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
    "/_authenticated/_admin/a/courses/$courseId/assignments/$assignmentId/submissions/$submissionId"
)({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY, ROLE.ADMIN], isPending)
        return {
            breadcrumb: "Grade Submission",
        }
    },
    component: GradingView,
})

