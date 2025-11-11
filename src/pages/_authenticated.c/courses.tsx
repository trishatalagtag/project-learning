import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/c/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/c/courses"!</div>
}
