import { CoursesTable } from "@/components/admin/courses/courses-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/a/courses/")({
  component: CoursesTable,
});
