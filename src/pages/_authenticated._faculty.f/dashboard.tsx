import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_faculty/f/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_faculty/"!</div>
}
