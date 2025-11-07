import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_learner/learn/library')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_learner/learn/library"!</div>
}
