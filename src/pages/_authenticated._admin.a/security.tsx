import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/security")({
    component: SecurityPage,
})

function SecurityPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Security</h1>
            <p className="text-muted-foreground">Security settings page - To be implemented</p>
        </div>
    )
}
