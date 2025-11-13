import { FacultyCoursesDashboard } from "@/components/faculty/dashboard/faculty-courses-dashboard"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty/f/")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
    },
    component: FacultyDashboardPage,
})

function FacultyDashboardPage() {
    return <FacultyCoursesDashboard />
}
