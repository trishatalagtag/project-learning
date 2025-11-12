import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/a/categories/")({
  component: CategoriesTable,
});
