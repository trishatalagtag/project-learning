import { ROLE } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, [ROLE.ADMIN, ROLE.FACULTY], isPending)
  },
  component: _RouteComponent,
})

function _RouteComponent() {
  return (
    <div>
      <h1>Faculty Dashboard</h1>
      <Outlet />
    </div>
  )
}
