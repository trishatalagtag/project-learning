import { ROLE } from "@/lib/auth"
import { requireRole } from "@/lib/auth-guards"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_learner")({
  beforeLoad: ({ context: { auth } }) => {
    const { isPending } = auth
    requireRole(auth.session, ROLE.LEARNER, isPending)
  },
  component: _RouteComponent,
})

function _RouteComponent() {
  return (
    <div>
      <h1>Learner Dashboard</h1>
      <Outlet />
    </div>
  )
}
