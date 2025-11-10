import { AdminBreadcrumbHeader } from "@/components/structure/admin-breadcrumb-header"
import AdminSidebar from "@/components/structure/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ROLE } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, ROLE.ADMIN, isPending)
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
        <div className="flex flex-col min-h-screen">
          <AdminBreadcrumbHeader />
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
