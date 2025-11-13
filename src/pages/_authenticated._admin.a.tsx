import { AdminBreadcrumbHeader } from "@/components/structure/admin-breadcrumb-header"
import AdminSidebar from "@/components/structure/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireRole } from "@/lib/auth/client"
import { ROLE } from "@/lib/auth/guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, [ROLE.ADMIN], isPending)
    return {
      breadcrumb: "Admin",
    }
  },
  component: _RouteComponent,
})

function _RouteComponent() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <AdminBreadcrumbHeader />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
