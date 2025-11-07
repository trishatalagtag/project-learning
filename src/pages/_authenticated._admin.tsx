import AppSidebar from "@/components/structure/sidebar"
import AppSidebarNav from "@/components/structure/sidebar-admin-nav"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ROLE } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, ROLE.ADMIN, isPending)
  },
  component: _RouteComponent,
})

function _RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="dock" intent="inset" />
      <SidebarInset>
        <AppSidebarNav />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
