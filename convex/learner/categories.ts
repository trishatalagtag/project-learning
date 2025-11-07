import { query } from "../_generated/server"

/**
 * List all categories for filtering courses
 */
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .order("asc")
      .collect()

    return categories.map(category => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      level: category.level,
      order: category.order,
      parentId: category.parentId,
      createdAt: category.createdAt,
    }))
  },
})
