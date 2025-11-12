import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/content-approvals")({
  component: ContentApprovalsLayout,
})

function ContentApprovalsLayout() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Outlet />
    </div>
  )
}
