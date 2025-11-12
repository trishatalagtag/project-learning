import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/a/categories/new")({
  component: NewCategoryPage,
});

function NewCategoryPage() {
  const navigate = useNavigate();

  return (
    <CategoryFormDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate({ to: "/a/categories" });
      }}
      onSuccess={() => {
        navigate({ to: "/a/categories" });
      }}
    />
  );
}

