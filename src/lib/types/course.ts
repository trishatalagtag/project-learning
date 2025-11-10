import type { FunctionReturnType } from "convex/server";

import type { api } from "@/convex/_generated/api";

// Infer from Convex queries (not manual definitions)
export type Course = NonNullable<
  FunctionReturnType<typeof api.admin.courses.getCourseById>
>;

export type CourseModule = FunctionReturnType<
  typeof api.faculty.modules.listModulesByCourse
>[number];

export type CourseLesson = FunctionReturnType<
  typeof api.faculty.lessons.listLessonsByModule
>[number];

export type LessonAttachment = FunctionReturnType<
  typeof api.faculty.attachments.listAttachmentsByLesson
>[number];

// Only define custom interfaces when adding CLIENT-SIDE fields
export interface CourseModuleWithLessons extends CourseModule {
  lessons?: CourseLesson[];
}

export type Category = FunctionReturnType<
  typeof api.shared.categories.listAllCategories
>[number];

export type FacultyUser = FunctionReturnType<
  typeof api.admin.users.listUsersByRole
>[number];

export type CourseStatus = Course["status"];
