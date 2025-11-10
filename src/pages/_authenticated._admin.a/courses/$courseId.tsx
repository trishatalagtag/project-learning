import { CourseDetailPage } from "@/components/admin/courses/course-detail-page";
import { courseParams } from "@/lib/hooks/use-route-params";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/_authenticated/_admin/a/courses/$courseId")({
  params: zodValidator(courseParams),
  component: CourseDetailPage,
});
