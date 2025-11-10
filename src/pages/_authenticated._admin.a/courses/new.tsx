import { CourseForm } from "@/components/admin/courses/course-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_admin/a/courses/new")({
  component: NewCourseModal,
});

function NewCourseModal() {
  const navigate = useNavigate();

  return (
    <CourseForm
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate({ to: "/a/courses" });
      }}
      mode="create"
      onSuccess={(courseId) => {
        navigate({ to: "/a/courses/$courseId", params: { courseId } });
      }}
    />
  );
}
