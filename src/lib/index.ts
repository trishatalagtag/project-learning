// Re-export all inferred types

// Re-export Convex generated types for convenience
export type { Doc, Id } from "@/convex/_generated/dataModel"
export type {
  Category,
  Course,
  CourseLesson,
  CourseModule,
  CourseModuleWithLessons,
  CourseStatus,
  FacultyUser,
  LessonAttachment,
} from "./types/course"
export type {
  LessonNavigation,
  ModuleWithLessons,
} from "./types/navigation"
