import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCourse(courseId: Id<"courses">) {
  const course = useQuery(api.admin.courses.getCourseById, { courseId });

  return {
    course,
    isLoading: course === undefined,
    isNotFound: course === null,
  } as const;
}
