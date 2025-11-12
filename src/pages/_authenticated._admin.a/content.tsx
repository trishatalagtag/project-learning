import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

const contentSearchSchema = z.object({
    sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional().default([]),
    columnFilters: z.record(z.string(), z.any()).optional().default({}),
    columnVisibility: z.record(z.string(), z.boolean()).optional().default({}),
    rowSelection: z.record(z.string(), z.boolean()).optional().default({}),
    pageIndex: z.number().optional().default(0),
    pageSize: z.number().optional().default(20),
    q: z.string().optional().default(""),
    contentType: z.enum(["module", "lesson", "quiz", "assignment"]).optional().default("module"),
    status: z.enum(["draft", "pending", "approved"]).optional().default("pending"),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const Route = createFileRoute("/_authenticated/_admin/a/content")({
    validateSearch: contentSearchSchema,
    beforeLoad: () => ({
        breadcrumb: "Content",
    }),
    component: () => {
        return (
            <div className="container mx-auto">
                <Outlet />
            </div>
        )
    }
});
