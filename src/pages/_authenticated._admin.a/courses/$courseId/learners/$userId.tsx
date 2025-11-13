import { LearnerProgressDetail } from "@/components/faculty/courses/progress/learner-progress-detail"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
    "/_authenticated/_admin/a/courses/$courseId/learners/$userId"
)({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY, ROLE.ADMIN], isPending)
        return {
            breadcrumb: "Learner Progress",
        }
    },
    component: LearnerProgressDetail,
})

