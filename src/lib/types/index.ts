// Re-export all inferred types
export type {
    Category, Course, CourseLesson, CourseModule, CourseModuleWithLessons, CourseStatus, FacultyUser, LessonAttachment
} from "./course";

export type {
    LessonNavigation,
    ModuleWithLessons
} from "./navigation";

// Re-export Convex generated types for convenience
export type { Doc, Id } from "@/convex/_generated/dataModel";

