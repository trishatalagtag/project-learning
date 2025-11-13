import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/contact")({
    component: ContactPage,
})

function ContactPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Support</h1>
            <p className="text-muted-foreground">Contact support page - To be implemented</p>
        </div>
    )
}
