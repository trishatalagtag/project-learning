import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";

/**
 * Manually trigger migrations - run this ONCE from frontend or dashboard
 */
export const triggerMigrations = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // TypeScript error is expected until Convex regenerates types
    // The function will work correctly at runtime
    await ctx.scheduler.runAfter(0, (internal as any).migrations.index.checkAndRunMigrations);
    return null;
  },
});

