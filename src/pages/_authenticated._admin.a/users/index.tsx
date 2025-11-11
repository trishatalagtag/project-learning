import { createFileRoute } from "@tanstack/react-router"

import { UsersTable } from "@/components/admin/users/users-table"

export const Route = createFileRoute("/_authenticated/_admin/a/users/")({
  component: UsersPage,
})

function UsersPage() {
  return (
    <div className="space-y-6">
      <UsersTable />
    </div>
  )
}
