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
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
