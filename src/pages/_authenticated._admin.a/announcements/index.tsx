import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/announcements/")({
    component: AnnouncementsPage,
})

function AnnouncementsPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Announcements</h1>
            <p className="text-muted-foreground">Announcements page - To be implemented</p>
        </div>
    )
}
