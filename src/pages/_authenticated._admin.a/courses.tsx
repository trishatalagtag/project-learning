import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

const coursesSearchSchema = z.object({
  sorting: z.array(z.object({ id: z.string(), desc: z.boolean() })).optional().default([]),
  columnFilters: z.record(z.string(), z.any()).optional().default({}),
  columnVisibility: z.record(z.string(), z.boolean()).optional().default({}),
  rowSelection: z.record(z.string(), z.boolean()).optional().default({}),
  pageIndex: z.number().optional().default(0),
  pageSize: z.number().optional().default(10),
  q: z.string().optional().default(""),
  status: z.enum(["all", "draft", "pending", "approved", "published", "archived"]).optional().default("all"),
  categoryId: z.string().optional().default(""),
  teacherId: z.string().optional().default(""),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const Route = createFileRoute("/_authenticated/_admin/a/courses")({
  validateSearch: coursesSearchSchema,
  beforeLoad: () => ({
    breadcrumb: "Courses",
  }),
  component: () => {
    return <Outlet />
  }
});
