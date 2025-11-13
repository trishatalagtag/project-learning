import { CourseForm } from "@/components/admin/courses/course-form"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty/f/courses/new")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
    },
    component: NewCourseModal,
})

function NewCourseModal() {
    const navigate = useNavigate()

    return (
        <CourseForm
            open={true}
            onOpenChange={(open) => {
                if (!open) navigate({ to: "/f/courses" })
            }}
            mode="create"
            onSuccess={(courseId) => {
                navigate({ to: "/f/courses/$courseId", params: { courseId } })
            }}
        />
    )
}

