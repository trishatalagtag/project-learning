import type { Id } from "@/convex/_generated/dataModel"
import { z } from "zod"

export const categoryLevels = [1, 2, 3] as const

export const categoryLevelSchema = z
  .number({
    message: "Level is required",
  })
  .int("Level must be a whole number")
  .min(1, "Level must be between 1 and 3")
  .max(3, "Level must be between 1 and 3")

const baseCategorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description is too long"),
  level: categoryLevelSchema,
  parentId: z
    .string()
    .min(1, "Parent category is required")
    .transform((value) => value as Id<"categories">)
    .optional(),
  order: z
    .number({
      message: "Order must be a number",
    })
    .int("Order must be a whole number")
    .min(0, "Order must be a positive number")
    .optional(),
})

export const createCategorySchema = baseCategorySchema
  .superRefine((data, ctx) => {
    if (data.level === 1 && data.parentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Level 1 categories cannot have a parent",
        path: ["parentId"],
      })
    }

    if (data.level > 1 && !data.parentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Level ${data.level} categories require a parent`,
        path: ["parentId"],
      })
    }
  })
  .transform((data) => ({
    name: data.name.trim(),
    description: data.description.trim(),
    level: data.level,
    parentId: data.parentId,
    order: data.order,
  }))

export const updateCategorySchema = z
  .object({
    categoryId: z
      .string({
        message: "Category ID is required",
      })
      .transform((value) => value as Id<"categories">),
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name is too long")
      .optional(),
    description: z
      .string()
      .trim()
      .min(3, "Description must be at least 3 characters")
      .max(500, "Description is too long")
      .optional(),
    order: z
      .number({
        message: "Order must be a number",
      })
      .int("Order must be a whole number")
      .min(0, "Order must be a positive number")
      .optional(),
    level: categoryLevelSchema.optional(),
    parentId: z
      .string()
      .transform((value) => (value === "" ? undefined : (value as Id<"categories">)))
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.level !== undefined) {
      if (data.level === 1 && data.parentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Level 1 categories cannot have a parent",
          path: ["parentId"],
        })
      }

      if (data.level > 1 && data.parentId === undefined && data.parentId !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Level ${data.level} categories require a parent`,
          path: ["parentId"],
        })
      }
    }
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.order !== undefined ||
      data.level !== undefined ||
      data.parentId !== undefined,
    {
      message: "No updates provided",
      path: ["name"],
    },
  )

export const deleteCategorySchema = z.object({
  categoryId: z
    .string({
      message: "Category ID is required",
    })
    .transform((value) => value as Id<"categories">),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>
