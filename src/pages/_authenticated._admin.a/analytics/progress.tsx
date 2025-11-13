import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/analytics/progress")({
    component: AnalyticsProgressPage,
})

function AnalyticsProgressPage() {
    return (
        <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
            <h1 className="mb-6 font-bold text-3xl">Student Progress Analytics</h1>
            <p className="text-muted-foreground">Student progress analytics page - To be implemented</p>
        </div>
    )
}
