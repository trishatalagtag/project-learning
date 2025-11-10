import type { Id, TableNames } from "@/convex/_generated/dataModel";
import { z } from "zod";

/**
 * Create a Zod schema that validates and transforms string to Id<T>
 * Matches Convex v.id() validator behavior
 */
export function createIdParam<T extends TableNames>(_tableName: T) {
  return z.string().transform((id) => id as Id<T>);
}

// Common param schemas
export const lessonParams = z.object({
  lessonId: createIdParam("lessons"),
});

export const moduleParams = z.object({
  moduleId: createIdParam("modules"),
});

export const lessonWithModuleParams = z.object({
  moduleId: createIdParam("modules"),
  lessonId: createIdParam("lessons"),
});

export const courseParams = z.object({
  courseId: createIdParam("courses"),
});

export const assignmentParams = z.object({
  assignmentId: createIdParam("assignments"),
});

export const quizParams = z.object({
  quizId: createIdParam("quizzes"),
});
