import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/c/settings")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
    },
    component: LearnerSettingsPage,
})

function LearnerSettingsPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Settings</h1>
            <p className="text-muted-foreground">Learner settings page - To be implemented</p>
        </div>
    )
}
