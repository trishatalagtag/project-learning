import { LearnerProgressDetail } from "@/components/faculty/courses/progress/learner-progress-detail"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const learnerParams = z.object({
    courseId: z.string(),
    userId: z.string(),
})

export const Route = createFileRoute(
    "/_authenticated/_faculty/f/courses/$courseId/learners/$userId"
)({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Learner Progress",
        }
    },
    params: learnerParams,
    component: LearnerProgressDetail,
})
