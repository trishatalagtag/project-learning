import type { FunctionReturnType } from "convex/server";

import type { api } from "@/convex/_generated/api";

export type ModuleWithLessons = FunctionReturnType<
  typeof api.faculty.navigation.getModulesWithLessons
>[number];

// Only define custom types for CLIENT-SIDE logic
export interface LessonNavigation {
  previous: {
    lessonId: string;
    moduleId: string;
    lessonTitle: string;
    moduleTitle: string;
  } | null;
  next: {
    lessonId: string;
    moduleId: string;
    lessonTitle: string;
    moduleTitle: string;
  } | null;
}
