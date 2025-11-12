import { LoadingPage } from "@/components/shared/loading/loading-page";
import { CourseSidebar } from "@/components/structure/course-sidebar";
import { CourseSidebarMobileTrigger } from "@/components/structure/course-sidebar-primitives";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "convex/react";

import { courseParams } from "@/hooks/use-route-params";

export const Route = createFileRoute("/_authenticated/c/$courseId")({
  params: zodValidator(courseParams),
  component: CourseLayout,
});

function CourseLayout() {
  const { courseId } = Route.useParams();

  // Fetch course and modules once at layout level
  const course = useQuery(api.faculty.courses.getCourseById, {
    courseId: courseId as Id<"courses">
  });
  const modules = useQuery(
    api.shared.content.getModulesWithLessons,
    course ? { courseId: courseId as Id<"courses"> } : "skip"
  );


  if (course === undefined || modules === undefined) {
    return <LoadingPage message="Loading course..." />;
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Course not found</p>
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
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3 md:hidden">
          <CourseSidebarMobileTrigger />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-sm">{course.title}</h1>
          </div>
        </header>

        {/* Main Content */}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}