import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/logout")({
    beforeLoad: async () => {
        // Perform logout logic here
        // For now, redirect to login
        throw redirect({ to: "/staff/login" })
    },
})
