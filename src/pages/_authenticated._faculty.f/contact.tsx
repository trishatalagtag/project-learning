import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty/f/contact")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
    },
    component: FacultyContactPage,
})

function FacultyContactPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Support</h1>
            <p className="text-muted-foreground">Faculty contact support page - To be implemented</p>
        </div>
    )
}
