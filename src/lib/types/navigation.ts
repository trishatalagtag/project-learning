import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";

export type ModuleWithLessons = FunctionReturnType<
  typeof api.shared.content.getModulesWithLessons
>[number];

// Only define custom types for CLIENT-SIDE logic
export interface LessonNavigation {
  previous: {
    lessonId: Id<"lessons">;
    moduleId: Id<"modules">;
    lessonTitle: string;
    moduleTitle: string;
  } | null;
  next: {
    lessonId: Id<"lessons">;
    moduleId: Id<"modules">;
    lessonTitle: string;
    moduleTitle: string;
  } | null;
}
