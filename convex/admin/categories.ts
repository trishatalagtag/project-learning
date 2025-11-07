import { v } from "convex/values";
import { adminMutation, adminQuery } from "../lib/functions";

/**
 * List all categories (admin view with full details)
 * Admin only
 */
export const listCategories = adminQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      level: v.number(),
      order: v.number(),
      parentId: v.optional(v.id("categories")),
      parentName: v.optional(v.string()),
      courseCount: v.number(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();

    // Enrich with parent names and course counts
    const enrichedCategories = await Promise.all(
      categories.map(async (category) => {
        let parentName: string | undefined;
        if (category.parentId) {
          const parent = await ctx.db.get(category.parentId);
          parentName = parent?.name;
        }

        // Count courses in this category
        const courses = await ctx.db
          .query("courses")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        return {
          _id: category._id,
          _creationTime: category._creationTime,
          name: category.name,
          description: category.description,
          level: category.level,
          order: category.order,
          parentId: category.parentId,
          parentName,
          courseCount: courses.length,
          createdAt: category.createdAt,
        };
      })
    );

    // Sort by level, then order
    return enrichedCategories.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.order - b.order;
    });
  },
});

/**
 * Create new category
 * Admin only
 */
export const createCategory = adminMutation({
  args: {
    name: v.string(),
    description: v.string(),
    level: v.number(), // 1, 2, or 3
    parentId: v.optional(v.id("categories")),
    order: v.optional(v.number()),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    // Validate level
    if (args.level < 1 || args.level > 3) {
      throw new Error("Level must be 1, 2, or 3");
    }

    // Validate parent relationship
    if (args.level > 1 && !args.parentId) {
      throw new Error(`Level ${args.level} category requires a parent`);
    }

    if (args.level === 1 && args.parentId) {
      throw new Error("Level 1 category cannot have a parent");
    }

    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent) {
        throw new Error("Parent category not found");
      }

      // Validate parent level is correct
      const expectedParentLevel = args.level - 1;
      if (parent.level !== expectedParentLevel) {
        throw new Error(
          `Level ${args.level} category must have Level ${expectedParentLevel} parent`
        );
      }
    }

    // Get next order number if not provided
    let order = args.order ?? 0;
    if (order === 0) {
      const siblings = await ctx.db
        .query("categories")
        .withIndex("by_parent", (q) =>
          args.parentId ? q.eq("parentId", args.parentId) : q.eq("parentId", undefined)
        )
        .collect();
      order = siblings.length;
    }

    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      description: args.description,
      level: args.level,
      parentId: args.parentId,
      order,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

/**
 * Update category
 * Admin only
 */
export const updateCategory = adminMutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    // Build update object
    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.order !== undefined) updates.order = args.order;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.categoryId, updates);
    }

    return null;
  },
});

/**
 * Delete category
 * Admin only - cannot delete if has children or courses
 */
export const deleteCategory = adminMutation({
  args: { categoryId: v.id("categories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    // Check for child categories
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.categoryId))
      .collect();

    if (children.length > 0) {
      throw new Error(
        "Cannot delete category with child categories. Delete children first."
      );
    }

    // Check for courses in this category
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    if (courses.length > 0) {
      throw new Error(
        `Cannot delete category with ${courses.length} course(s). Move courses first.`
      );
    }

    await ctx.db.delete(args.categoryId);

    return null;
  },
});