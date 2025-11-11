import { v } from "convex/values";
import { components } from "../_generated/api";
import { authenticatedMutation } from "../lib/functions";

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
    // ctx.user._id is the auth component user ID
    const authUserId = ctx.user._id;

    const user = await ctx.runQuery(components.auth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: authUserId }],
    })

    if (!user) {
      throw new Error("User not found");
    }

    const updates: {
      name?: string;
      bio?: string | null;
      image?: string | null;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    let imageUrl: string | null = null;
    if (args.image) {
      imageUrl = await ctx.storage.getUrl(args.image);
    }

    if (args.name) updates.name = args.name;
    if (args.bio) updates.bio = args.bio;
    if (imageUrl) updates.image = imageUrl;

    await ctx.runMutation(components.auth.adapter.updateOne, {
      input: {
        model: "user",
        update: updates,
        where: [{ field: "_id", operator: "eq", value: user._id }],
      },
    });

    return null
  },
})