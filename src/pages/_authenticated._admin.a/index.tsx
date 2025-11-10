import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin/a/')({
  beforeLoad: () => ({
    breadcrumb: "Dashboard",
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_admin/a/"!</div>
}
