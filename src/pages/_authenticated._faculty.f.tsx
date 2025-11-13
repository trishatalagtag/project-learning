import { FacultyBreadcrumbHeader } from "@/components/structure/faculty-breadcrumb-header"
import FacultySidebar from "@/components/structure/faculty-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty/f")({
    beforeLoad: ({ context: { auth } }) => {
        const { isPending } = auth
        requireRole(auth.session, [ROLE.FACULTY], isPending)
        return {
            breadcrumb: "Faculty",
        }
    },
    component: _RouteComponent,
})

function _RouteComponent() {
    return (
        <SidebarProvider>
            <FacultySidebar />
            <SidebarInset>
                <div className="flex min-h-screen flex-col">
                    <FacultyBreadcrumbHeader />
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
