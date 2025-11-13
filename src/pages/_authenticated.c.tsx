import { LearnerBreadcrumbHeader } from "@/components/structure/learner-breadcrumb-header"
import LearnerSidebar from "@/components/structure/learner-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/c")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.LEARNER], isPending)
        return {
            breadcrumb: "Learner",
        }
    },
    component: _RouteComponent,
})

function _RouteComponent() {
    return (
        <SidebarProvider>
            <LearnerSidebar />
            <SidebarInset>
                <div className="flex min-h-screen flex-col">
                    <LearnerBreadcrumbHeader />
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
