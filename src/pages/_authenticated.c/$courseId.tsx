import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { CourseSidebar } from "@/components/shared/learning/course-sidebar";
import { CourseSidebarHeader } from "@/components/shared/learning/course-sidebar-header";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { courseParams } from "@/lib/hooks/use-route-params";

export const Route = createFileRoute("/_authenticated/c/$courseId")({
  params: zodValidator(courseParams),
  component: CourseLayout,
});

function CourseLayout() {
  const { courseId } = Route.useParams();
  const matches = useMatches();

  // Fetch course and modules once at layout level
  const course = useQuery(api.faculty.courses.getCourseById, {
    courseId: courseId as Id<"courses">
  });
  const modules = useQuery(
    api.faculty.navigation.getModulesWithLessons,
    course ? { courseId: courseId as Id<"courses"> } : "skip"
  );

  // Extract current route data for header
  const currentMatch = matches[matches.length - 1];
  const { moduleId, lessonId } = (currentMatch?.params || {}) as {
    moduleId?: string;
    lessonId?: string;
  };

  // Find current module and lesson titles
  const currentModule = modules?.find((m) => m._id === moduleId);
  const currentLesson = currentModule?.lessons.find((l) => l._id === lessonId);

  if (course === undefined || modules === undefined) {
    return <LoadingPage message="Loading course..." />;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <CourseSidebar
        courseId={courseId as Id<"courses">}
        courseTitle={course.title}
        modules={modules}
      />

      <SidebarInset>
        {/* Header moved to layout */}
        <CourseSidebarHeader
          courseTitle={course.title}
          moduleTitle={currentModule?.title}
          lessonTitle={currentLesson?.title}
        />

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
