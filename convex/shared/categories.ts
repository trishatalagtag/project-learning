import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * List all categories (public, for browsing courses)
 * Returns hierarchical structure: Level 1 → Level 2 → Level 3
 */
export const listAllCategories = query({
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
      createdAt: v.number(),
      // Include children for tree structure
      children: v.optional(
        v.array(
          v.object({
            _id: v.id("categories"),
            name: v.string(),
            description: v.string(),
            level: v.number(),
            order: v.number(),
            children: v.optional(
              v.array(
                v.object({
                  _id: v.id("categories"),
                  name: v.string(),
                  description: v.string(),
                  level: v.number(),
                  order: v.number(),
                })
              )
            ),
          })
        )
      ),
    })
  ),
  handler: async (ctx) => {
    // get all categories
    const allCategories = await ctx.db
      .query("categories")
      .order("asc")
      .collect();

    // build hierarchical structure
    const level1Categories = allCategories.filter((c) => c.level === 1);
    const level2Categories = allCategories.filter((c) => c.level === 2);
    const level3Categories = allCategories.filter((c) => c.level === 3);

    // map level 1 categories with their children
    return level1Categories
      .sort((a, b) => a.order - b.order)
      .map((level1) => ({
        ...level1,
        children: level2Categories
          .filter((c) => c.parentId === level1._id)
          .sort((a, b) => a.order - b.order)
          .map((level2) => ({
            _id: level2._id,
            name: level2.name,
            description: level2.description,
            level: level2.level,
            order: level2.order,
            children: level3Categories
              .filter((c) => c.parentId === level2._id)
              .sort((a, b) => a.order - b.order)
              .map((level3) => ({
                _id: level3._id,
                name: level3.name,
                description: level3.description,
                level: level3.level,
                order: level3.order,
              })),
          })),
      }));
  },
});