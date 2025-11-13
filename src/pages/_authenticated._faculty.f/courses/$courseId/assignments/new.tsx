import { CreateAssignmentPage } from "@/components/faculty/courses/assignments/create-assignment-page"
import { courseParams } from "@/hooks/use-route-params"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_authenticated/_faculty/f/courses/$courseId/assignments/new")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, [ROLE.FACULTY], isPending)
  },
  params: zodValidator(courseParams),
  component: CreateAssignmentPage,
})
