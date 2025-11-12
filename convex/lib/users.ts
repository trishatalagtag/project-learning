import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

/**
 * Update user profile (name, bio, avatar)
 */
export async function updateUserProfile(
    ctx: MutationCtx,
    authUserId: string,
    updates: {
        name?: string;
        bio?: string;
        image?: Id<"_storage">;
    }
): Promise<void> {
    const user = await ctx.runQuery(components.auth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: authUserId }],
    });

    if (!user) {
        throw new Error("User not found");
    }

    const profileUpdates: {
        name?: string;
        bio?: string | null;
        image?: string | null;
        updatedAt: number;
    } = {
        updatedAt: Date.now(),
    };

    let imageUrl: string | null = null;
    if (updates.image) {
        imageUrl = await ctx.storage.getUrl(updates.image);
    }

    if (updates.name) profileUpdates.name = updates.name;
    if (updates.bio) profileUpdates.bio = updates.bio;
    if (imageUrl) profileUpdates.image = imageUrl;

    await ctx.runMutation(components.auth.adapter.updateOne, {
        input: {
            model: "user",
            update: profileUpdates,
            where: [{ field: "_id", operator: "eq", value: user._id }],
        },
    });
}

