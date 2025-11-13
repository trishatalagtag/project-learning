import { authClient } from "@/lib/auth/guards"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_faculty/f/logout")({
    beforeLoad: async () => {
        await authClient.signOut()
        throw redirect({ to: "/staff/login" })
    },
})
