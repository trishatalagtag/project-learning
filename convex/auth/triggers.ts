import { v } from "convex/values";
import { components } from "../_generated/api";
import { internalMutation } from "../_generated/server";

/**
 * Trigger: Auto-populate userId when user is created
 * This is called automatically by Better Auth after user creation
 */
export const onUserCreate = internalMutation({
  args: {
    userId: v.string(), // The _id of the newly created user
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Set userId = _id for new users
    await ctx.runMutation(components.auth.adapter.updateOne, {
      input: {
        model: "user",
        update: {
          userId: args.userId,
          updatedAt: Date.now(),
        } as { userId: string; updatedAt: number },
        where: [{ field: "_id", operator: "eq", value: args.userId }],
      },
    });
    return null;
  },
});

