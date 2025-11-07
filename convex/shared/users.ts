import { v } from "convex/values"
import { components } from "../_generated/api"
import { authenticatedMutation } from "../lib/functions"

/**
 * Update user profile (name, bio, avatar)
 */
export const updateProfile = authenticatedMutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = ctx.user.userId

    const user = await ctx.runQuery(components.auth.adapter.findOne, {
        model: "user",
        where: [{ field: "userId", operator: "eq", value: userId }],
    })

    if (!user) {
      throw new Error("User not found")
    }

    let imageUrl: string | null = null
    if (args.image) {
      imageUrl = await ctx.storage.getUrl(args.image)
    }

    await ctx.db.patch(user._id, {
      ...(args.name && { name: args.name }),
      ...(args.bio && { bio: args.bio }),
      ...(imageUrl && { image: imageUrl }),
      updatedAt: Date.now(),
    })

    return null
  },
})