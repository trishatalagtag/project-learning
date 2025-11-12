import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/content-approvals")({
  component: ContentApprovalsLayout,
})

function ContentApprovalsLayout() {
  return <Outlet />
}
