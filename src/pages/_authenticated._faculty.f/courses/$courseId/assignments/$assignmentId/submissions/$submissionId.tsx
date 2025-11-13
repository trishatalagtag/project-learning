import { GradingView } from "@/components/faculty/courses/assignments/grading-view"
import { assignmentParams, courseParams } from "@/hooks/use-route-params"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

const submissionParams = z.object({
  submissionId: z.string(),
})

export const Route = createFileRoute(
  "/_authenticated/_faculty/f/courses/$courseId/assignments/$assignmentId/submissions/$submissionId"
)({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, [ROLE.FACULTY], isPending)
    return {
      breadcrumb: "Grade Submission",
    }
  },
  params: zodValidator(courseParams.merge(assignmentParams).merge(submissionParams)),
  component: GradingView,
})
