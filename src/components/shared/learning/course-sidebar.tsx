import { XMarkIcon } from "@heroicons/react/24/solid";
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import * as React from "react";

import {
  CourseLesson,
  CourseLessonDetails,
  CourseLessonIcon,
  CourseLessonList,
  CourseLessonMeta,
  CourseLessonTitle,
  CourseModule,
  CourseModuleChevron,
  CourseModuleContent,
  CourseModuleHeader,
  CourseModuleLabel,
  CourseModuleNumber,
  CourseModuleTitle,
  CourseSidebarClose,
  CourseSidebarContent,
  CourseSidebarHeader,
  CourseSidebar as CourseSidebarPrimitive,
  CourseSidebarTitle,
} from "./course-sidebar-primitives";

import { Badge } from "@/components/ui/badge";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ContentStatus } from "@/lib/constants/content-status";
import { CONTENT_STATUS, STATUS_CONFIG } from "@/lib/constants/content-status";
import { ROLE, canViewUnpublishedContent } from "@/lib/rbac/permissions";
import { useUserId, useUserRole } from "@/lib/rbac/use-user-role";
import type { ModuleWithLessons } from "@/lib/types/navigation";

interface CourseSidebarProps {
  courseId: Id<"courses">;
  courseTitle: string;
  modules: ModuleWithLessons[];
}

export function CourseSidebar({
  courseId,
  courseTitle,
  modules,
}: CourseSidebarProps) {
  const userRole = useUserRole();
  const userId = useUserId();
  const showUnpublished = userRole ? canViewUnpublishedContent(userRole) : false;
  const isLearner = userRole === ROLE.LEARNER;

  // Detect current route
  const params = useParams({ strict: false }) as {
    moduleId?: string;
    lessonId?: string;
  };
  const currentModuleId = params.moduleId;
  const currentLessonId = params.lessonId;

  // Fetch progress ONLY for learners
  const lessonProgress = useQuery(
    api.learner.progress.getLessonProgressByCourse,
    isLearner && userId ? { courseId } : "skip"
  );

  // Auto-expand logic
  const defaultOpenModules = React.useMemo(() => {
    const openIds = new Set<string>();

    if (currentModuleId) {
      openIds.add(currentModuleId);
    }

    if (currentLessonId) {
      const moduleWithLesson = modules.find((m) =>
        m.lessons?.some((l) => l._id === currentLessonId)
      );
      if (moduleWithLesson) {
        openIds.add(moduleWithLesson._id);
      }
    }

    // Default to first module if nothing active
    if (openIds.size === 0 && modules[0]) {
      openIds.add(modules[0]._id);
    }

    return openIds;
  }, [currentModuleId, currentLessonId, modules]);

  return (
    <CourseSidebarPrimitive>
      {/* Header */}
      <CourseSidebarHeader>
        <CourseSidebarTitle asChild>
          <Link
            to="/c/$courseId"
            params={{ courseId }}
            title={`${courseTitle} - Home Page`}
          >
            {courseTitle}
          </Link>
        </CourseSidebarTitle>

        <CourseSidebarClose>
          <XMarkIcon className="size-5" />
        </CourseSidebarClose>
      </CourseSidebarHeader>

      {/* Scrollable Content */}
      <CourseSidebarContent>
        {/* Course Overview */}
        <div className="border-b border-sidebar-border">
          <CourseLessonList>
            <CourseLesson
              asChild
              active={!currentModuleId && !currentLessonId}
            >
              <Link to="/c/$courseId" params={{ courseId }}>
                <CourseLessonIcon status="overview" />

                <CourseLessonDetails>
                  <CourseLessonTitle active={!currentModuleId && !currentLessonId}>
                    Course Overview
                  </CourseLessonTitle>
                  <CourseLessonMeta>Introduction</CourseLessonMeta>
                </CourseLessonDetails>
              </Link>
            </CourseLesson>
          </CourseLessonList>
        </div>

        {/* Modules */}
        {modules.map((module, index) => {
          const isDefaultOpen = defaultOpenModules.has(module._id);
          const moduleConfig = STATUS_CONFIG[module.status as ContentStatus];
          const hasLessons = module.lessons && module.lessons.length > 0;
          const isCurrentModule = module._id === currentModuleId;

          return (
            <CourseModule key={module._id} defaultOpen={isDefaultOpen}>
              <CourseModuleHeader>
                <CourseModuleLabel>
                  <CourseModuleNumber>Module {index + 1}</CourseModuleNumber>
                  <CourseModuleTitle>{module.title}</CourseModuleTitle>
                </CourseModuleLabel>

                {showUnpublished && module.status !== CONTENT_STATUS.PUBLISHED && (
                  <Badge variant={moduleConfig.variant} className="mr-2 text-xs">
                    {moduleConfig.label}
                  </Badge>
                )}

                {hasLessons && <CourseModuleChevron />}
              </CourseModuleHeader>

              {hasLessons && (
                <CourseModuleContent>
                  <CourseLessonList>
                    {/* Module Overview */}
                    <CourseLesson
                      asChild
                      active={isCurrentModule && !currentLessonId}
                    >
                      <Link
                        to="/c/$courseId/m/$moduleId"
                        params={{
                          courseId,
                          moduleId: module._id,
                        }}
                      >
                        <CourseLessonIcon status="overview" />
                        <CourseLessonDetails>
                          <CourseLessonTitle active={isCurrentModule && !currentLessonId}>
                            Module Overview
                          </CourseLessonTitle>
                          <CourseLessonMeta>Introduction</CourseLessonMeta>
                        </CourseLessonDetails>
                      </Link>
                    </CourseLesson>

                    {/* Lessons */}
                    {module.lessons.map((lesson) => {
                      const isCurrentLesson = lesson._id === currentLessonId;

                      const lessonConfig = STATUS_CONFIG[lesson.status as ContentStatus];

                      // Determine icon status based on role
                      let iconStatus: "completed" | "incomplete" | "overview" | "draft" | "pending" | "approved" | "published" = "incomplete";

                      if (isLearner) {
                        // Learners see completion status
                        const progressRecord = lessonProgress?.find((p) => p.lessonId === lesson._id);
                        iconStatus = progressRecord?.completed ? "completed" : "incomplete";
                      } else {
                        // Faculty/Admin see status-based icons
                        iconStatus = lesson.status as typeof iconStatus;
                      }

                      return (
                        <CourseLesson
                          key={lesson._id}
                          asChild
                          active={isCurrentLesson}
                        >
                          <Link
                            to="/c/$courseId/m/$moduleId/lessons/$lessonId"
                            params={{
                              courseId,
                              moduleId: module._id,
                              lessonId: lesson._id,
                            }}
                          >
                            <CourseLessonIcon status={iconStatus} />

                            <CourseLessonDetails>
                              <CourseLessonTitle active={isCurrentLesson}>
                                {lesson.title}
                              </CourseLessonTitle>
                              <CourseLessonMeta>Lesson</CourseLessonMeta>
                            </CourseLessonDetails>

                            {showUnpublished &&
                              lesson.status !== CONTENT_STATUS.PUBLISHED && (
                                <Badge
                                  variant={lessonConfig.variant}
                                  className="ml-auto shrink-0 text-xs"
                                >
                                  {lessonConfig.label}
                                </Badge>
                              )}
                          </Link>
                        </CourseLesson>
                      );
                    })}
                  </CourseLessonList>
                </CourseModuleContent>
              )}
            </CourseModule>
          );
        })}
      </CourseSidebarContent>
    </CourseSidebarPrimitive>
  );
}