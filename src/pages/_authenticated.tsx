import { requireAuth } from "@/lib/auth/client"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context: { auth }, location }) => {
    const { isPending } = auth
    requireAuth(auth.session, location, isPending)
  },
})
