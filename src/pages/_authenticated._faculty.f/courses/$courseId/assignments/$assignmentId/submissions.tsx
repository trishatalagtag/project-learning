import { SubmissionsList } from "@/components/faculty/courses/assignments/submissions-list"
import { assignmentParams, courseParams } from "@/hooks/use-route-params"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

const submissionsSearchSchema = z.object({
  status: z.enum(["all", "draft", "submitted", "graded"]).optional().default("all"),
  readyToGrade: z.boolean().optional(),
  search: z.string().optional(),
  pageIndex: z.number().optional().default(0),
  pageSize: z.number().optional().default(10),
  sortBy: z.string().optional().default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export const Route = createFileRoute(
  "/_authenticated/_faculty/f/courses/$courseId/assignments/$assignmentId/submissions"
)({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, [ROLE.FACULTY], isPending)
    return {
      breadcrumb: "Submissions",
    }
  },
  params: zodValidator(courseParams.merge(assignmentParams)),
  validateSearch: zodValidator(submissionsSearchSchema),
  component: SubmissionsList,
})
