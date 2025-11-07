import { createFileRoute } from "@tanstack/react-router"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const Route = createFileRoute("/_authenticated/_admin/a/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminDashboard />
}
