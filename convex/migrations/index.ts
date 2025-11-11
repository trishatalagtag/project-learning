import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import { internalMutation, internalQuery } from "../_generated/server";

/**
 * Track which migrations have been run
 */
const MIGRATIONS = {
  POPULATE_USER_IDS: "populate_user_ids_v1",
} as const;

/**
 * Check if a migration has been run
 */
export const hasMigrationRun = internalQuery({
  args: { migrationId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const migration = await ctx.db
      .query("migrations")
      .withIndex("by_migration_id", (q) => q.eq("migrationId", args.migrationId))
      .first();
    
    return migration !== null;
  },
});

/**
 * Mark a migration as run
 */
export const markMigrationRun = internalMutation({
  args: { 
    migrationId: v.string(),
    description: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("migrations", {
      migrationId: args.migrationId,
      description: args.description,
      runAt: Date.now(),
    });
    return null;
  },
});

/**
 * Populate userId for existing users (one-time migration)
 */
export const populateUserIds = internalMutation({
  args: {},
  returns: v.object({
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    console.log("Running migration: populate_user_ids_v1");
    
    // Get all users
    const usersResult = await ctx.runQuery(components.auth.adapter.findMany, {
      model: "user",
      where: [],
      limit: 1000,
      offset: 0,
      paginationOpts: {
        cursor: null,
        numItems: 1000,
      }
    });

    // Extract users from response
    const users = Array.isArray(usersResult) 
      ? usersResult 
      : (usersResult && typeof usersResult === "object" 
          ? (usersResult.data ?? usersResult.items ?? [])
          : []);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      if (!user.userId && user._id) {
        await ctx.runMutation(components.auth.adapter.updateOne, {
          input: {
            model: "user",
            update: {
              userId: String(user._id),
              updatedAt: Date.now(),
            } as any,
            where: [{ field: "_id", operator: "eq", value: user._id }],
          },
        });
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`Migration complete: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped };
  },
});

/**
 * Check and run pending migrations
 */
export const checkAndRunMigrations = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if populate_user_ids migration has been run
    const hasRun = await ctx.runQuery(internal.migrations.index.hasMigrationRun, {
      migrationId: MIGRATIONS.POPULATE_USER_IDS,
    });

    if (!hasRun) {
      console.log("Running pending migration: populate_user_ids_v1");
      
      const result = await ctx.runMutation(internal.migrations.index.populateUserIds);
      
      await ctx.runMutation(internal.migrations.index.markMigrationRun, {
        migrationId: MIGRATIONS.POPULATE_USER_IDS,
        description: "Populate userId field for existing users",
      });

      console.log("Migration completed:", result);
    } else {
      console.log("Migration already run: populate_user_ids_v1");
    }

    return null;
  },
});

