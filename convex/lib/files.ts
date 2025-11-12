import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import {
    ALLOWED_DOCUMENT_TYPES,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    validateFileSize,
    validateFileType,
} from "./validators";

/**
 * Generate upload URL for file storage
 */
export async function generateUploadUrl(ctx: MutationCtx): Promise<string> {
    return await ctx.storage.generateUploadUrl();
}

/**
 * Get file URL for download/viewing
 */
export async function getFileUrl(
    ctx: QueryCtx,
    fileId: Id<"_storage">
): Promise<string | null> {
    return await ctx.storage.getUrl(fileId);
}

/**
 * Validate file after upload (server-side validation)
 */
export async function validateFile(
    ctx: MutationCtx,
    fileId: Id<"_storage">,
    expectedType: "image" | "video" | "document"
): Promise<{
    valid: boolean;
    error?: string;
    metadata?: {
        contentType: string;
        size: number;
    };
}> {
    // get file metadata from _storage system table
    const fileMetadata = await ctx.db.system.get(fileId);

    if (!fileMetadata) {
        return {
            valid: false,
            error: "File not found",
        };
    }

    // validate file size (50MB max)
    if (!validateFileSize(fileMetadata.size)) {
        // delete invalid file
        await ctx.storage.delete(fileId);
        return {
            valid: false,
            error: "File size exceeds 50MB limit",
        };
    }

    // validate file type
    const allowedTypes =
        expectedType === "image"
            ? ALLOWED_IMAGE_TYPES
            : expectedType === "video"
                ? ALLOWED_VIDEO_TYPES
                : ALLOWED_DOCUMENT_TYPES;

    if (
        !fileMetadata.contentType ||
        !validateFileType(fileMetadata.contentType, allowedTypes)
    ) {
        // delete invalid file
        await ctx.storage.delete(fileId);
        return {
            valid: false,
            error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
        };
    }

    return {
        valid: true,
        metadata: {
            contentType: fileMetadata.contentType,
            size: fileMetadata.size,
        },
    };
}

/**
 * Check if file is referenced by course content
 */
export async function isFileInUse(
    ctx: QueryCtx | MutationCtx,
    fileId: Id<"_storage">
): Promise<boolean> {
    const [courseCover, guideImages, submissionFiles, lessonAttachments] =
        await Promise.all([
            ctx.db
                .query("courses")
                .filter((q) => q.eq(q.field("coverImageId"), fileId))
                .first(),
            ctx.db
                .query("guideSteps")
                .filter((q) => q.eq(q.field("imageId"), fileId))
                .first(),
            ctx.db
                .query("assignmentSubmissions")
                .filter((q) => q.eq(q.field("fileId"), fileId))
                .first(),
            ctx.db
                .query("lessonAttachments")
                .filter((q) => q.eq(q.field("fileId"), fileId))
                .first(),
        ]);

    return !!(courseCover || guideImages || submissionFiles || lessonAttachments);
}

/**
 * Delete file from storage
 * Prevents deletion if file is still referenced by course content
 */
export async function deleteFile(
    ctx: MutationCtx,
    fileId: Id<"_storage">
): Promise<void> {
    // Check if file is in use anywhere
    const inUse = await isFileInUse(ctx, fileId);

    if (inUse) {
        throw new Error(
            "Cannot delete file: it is still referenced by course content. Remove the reference first."
        );
    }

    // TODO: In production, add ownership verification based on your requirements
    await ctx.storage.delete(fileId);
}

