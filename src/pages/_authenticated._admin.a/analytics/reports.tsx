import { createFileRoute } from "@tanstack/react-router";

import { ReportGenerationForm } from "@/components/admin/analytics/report-generation-form";

export const Route = createFileRoute(
  "/_authenticated/_admin/a/analytics/reports",
)({
  staticData: {
    breadcrumb: "Generate Reports",
  },
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Generate Reports</h1>
        <p className="mt-2 text-muted-foreground">
          Create and export custom analytics reports
        </p>
      </div>

      <ReportGenerationForm />
    </div>
  );
}
