import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty/f/settings")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
    },
    component: FacultySettingsPage,
})

function FacultySettingsPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Settings</h1>
            <p className="text-muted-foreground">Faculty settings page - To be implemented</p>
        </div>
    )
}
