import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

const platformRolesWithAll = z.enum(["all", "LEARNER", "FACULTY", "ADMIN"]);

const usersSearchSchema = z.object({
    sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional().default([]),
    columnFilters: z.record(z.string(), z.any()).optional().default({}),
    columnVisibility: z.record(z.string(), z.boolean()).optional().default({}),
    rowSelection: z.record(z.string(), z.boolean()).optional().default({}),

    pageIndex: z.number().optional().default(0),
    pageSize: z.number().optional().default(10),

    q: z.string().optional().default(""),
    role: platformRolesWithAll.optional().default("all"),
    status: z.enum(["all", "active", "deactivated"]).optional().default("all"),

    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    view: z.enum(["table", "grid"]).optional().default("table"),
});

export const Route = createFileRoute("/_authenticated/_admin/a/users")({
    validateSearch: usersSearchSchema,
    beforeLoad: () => ({
        breadcrumb: "Users",
    }),
    component: () => {
        return <Outlet />
    }
});
