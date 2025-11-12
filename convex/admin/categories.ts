import { v } from "convex/values";
import { adminMutation, adminQuery } from "../lib/functions";

/**
 * List all categories
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

    const enrichedCategories = await Promise.all(
      categories.map(async (category) => {
        let parentName: string | undefined;
        if (category.parentId) {
          const parent = await ctx.db.get(category.parentId);
          parentName = parent?.name;
        }

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
    level: v.number(),
    parentId: v.optional(v.id("categories")),
    order: v.optional(v.number()),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    if (args.level < 1 || args.level > 3) {
      throw new Error("Level must be 1, 2, or 3");
    }

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

      const expectedParentLevel = args.level - 1;
      if (parent.level !== expectedParentLevel) {
        throw new Error(
          `Level ${args.level} category must have Level ${expectedParentLevel} parent`
        );
      }
    }

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
 * Recursively update children when parent level changes
 */
async function cascadeChildrenLevel(
  ctx: any,
  parentId: string,
  oldLevel: number,
  newLevel: number,
  newParentId: string | undefined
) {
  const children = await ctx.db
    .query("categories")
    .withIndex("by_parent", (q: any) => q.eq("parentId", parentId))
    .collect();

  for (const child of children) {
    const childNewLevel = child.level - oldLevel + newLevel;
    
    if (childNewLevel < 1 || childNewLevel > 3) {
      continue;
    }

    let childNewParentId: string | undefined;
    if (childNewLevel === 1) {
      childNewParentId = undefined;
    } else if (childNewLevel === 2) {
      childNewParentId = newLevel === 1 ? undefined : newParentId;
    } else {
      childNewParentId = newLevel === 2 ? newParentId : undefined;
    }

    await ctx.db.patch(child._id, {
      level: childNewLevel,
      parentId: childNewParentId,
    });

    await cascadeChildrenLevel(ctx, child._id, child.level, childNewLevel, childNewParentId);
  }
}

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
    level: v.optional(v.number()),
    parentId: v.optional(v.union(v.id("categories"), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.order !== undefined) updates.order = args.order;

    const levelChanged = args.level !== undefined && args.level !== category.level;
    const parentChanged = args.parentId !== undefined && args.parentId !== category.parentId;

    if (args.level !== undefined) {
      if (args.level < 1 || args.level > 3) {
        throw new Error("Level must be 1, 2, or 3");
      }
      updates.level = args.level;
    }

    if (args.parentId !== undefined) {
      if (args.parentId === null) {
        updates.parentId = undefined;
      } else {
        const parent = await ctx.db.get(args.parentId);
        if (!parent) {
          throw new Error("Parent category not found");
        }

        const newLevel = args.level ?? category.level;
        const expectedParentLevel = newLevel - 1;
        if (parent.level !== expectedParentLevel) {
          throw new Error(
            `Level ${newLevel} category must have Level ${expectedParentLevel} parent`
          );
        }

        if (args.parentId === args.categoryId) {
          throw new Error("Category cannot be its own parent");
        }

        updates.parentId = args.parentId;
      }
    }

    if (args.level !== undefined && args.level === 1 && args.parentId === undefined) {
      updates.parentId = undefined;
    }

    if (args.level !== undefined && args.level > 1 && !updates.parentId && !category.parentId) {
      throw new Error(`Level ${args.level} category requires a parent`);
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.categoryId, updates);
    }

    if (levelChanged || parentChanged) {
      const finalLevel = args.level ?? category.level;
      const finalParentId = updates.parentId !== undefined ? updates.parentId : category.parentId;
      await cascadeChildrenLevel(
        ctx,
        args.categoryId,
        category.level,
        finalLevel,
        finalParentId
      );
    }

    return null;
  },
});

/**
 * Delete category
 * Admin only
 */
export const deleteCategory = adminMutation({
  args: { categoryId: v.id("categories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    const children = await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.categoryId))
      .collect();

    if (children.length > 0) {
      throw new Error(
        "Cannot delete category with child categories. Delete children first."
      );
    }

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