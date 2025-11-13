import { CourseDetailPage } from "@/components/admin/courses/course-detail-page";
import { courseParams } from "@/hooks/use-route-params";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const courseDetailSearchSchema = z.object({
  tab: z.enum(["settings", "content", "grading", "announcements", "progress", "assessments"]).optional(),
});

export const Route = createFileRoute("/_authenticated/_admin/a/courses/$courseId")({
  params: zodValidator(courseParams),
  validateSearch: courseDetailSearchSchema,
  component: CourseDetailPage,
});
