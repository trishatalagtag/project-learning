import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/announcements/new")({
    component: CreateAnnouncementPage,
})

function CreateAnnouncementPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="mb-6 font-bold text-3xl">Create Announcement</h1>
            <p className="text-muted-foreground">Create announcement page - To be implemented</p>
        </div>
    )
}
