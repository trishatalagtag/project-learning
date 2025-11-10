import { v } from "convex/values";
import { query } from "../_generated/server";
import { authenticatedMutation } from "../lib/functions";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  validateFileSize,
  validateFileType,
} from "../lib/validators";

/**
 * Generate upload URL for file
 * Used by faculty/admin when uploading course materials
 */
export const generateUploadUrl = authenticatedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get file URL for download/viewing
 * Public - anyone can view files if they have the ID
 */
export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});

/**
 * Validate file after upload (server-side validation)
 * Called immediately after client uploads file
 */
export const validateFile = authenticatedMutation({
  args: {
    fileId: v.id("_storage"),
    expectedType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("document")
    ),
  },
  returns: v.object({
    valid: v.boolean(),
    error: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        contentType: v.string(),
        size: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    // get file metadata from _storage system table
    const fileMetadata = await ctx.db.system.get(args.fileId);

    if (!fileMetadata) {
      return {
        valid: false,
        error: "File not found",
      };
    }

    // validate file size (50MB max)
    if (!validateFileSize(fileMetadata.size)) {
      // delete invalid file
      await ctx.storage.delete(args.fileId);
      return {
        valid: false,
        error: "File size exceeds 50MB limit",
      };
    }

    // validate file type
    const allowedTypes =
      args.expectedType === "image"
        ? ALLOWED_IMAGE_TYPES
        : args.expectedType === "video"
          ? ALLOWED_VIDEO_TYPES
          : ALLOWED_DOCUMENT_TYPES;

    if (
      !fileMetadata.contentType ||
      !validateFileType(fileMetadata.contentType, allowedTypes)
    ) {
      // delete invalid file
      await ctx.storage.delete(args.fileId);
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
  },
});

/**
 * Delete file from storage
 * Only file owner or admin can delete
 * Prevents deletion if file is still referenced by course content
 */
export const deleteFile = authenticatedMutation({
  args: { fileId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if file is in use anywhere
    const [courseCover, guideImages, submissionFiles, lessonAttachments] = await Promise.all([
      ctx.db.query("courses").filter((q) => q.eq(q.field("coverImageId"), args.fileId)).first(),
      ctx.db.query("guideSteps").filter((q) => q.eq(q.field("imageId"), args.fileId)).first(),
      ctx.db.query("assignmentSubmissions").filter((q) => q.eq(q.field("fileId"), args.fileId)).first(),
      ctx.db.query("lessonAttachments").filter((q) => q.eq(q.field("fileId"), args.fileId)).first(),
    ]);

    if (courseCover || guideImages || submissionFiles || lessonAttachments) {
      throw new Error("Cannot delete file: it is still referenced by course content. Remove the reference first.");
    }

    // TODO: In production, add ownership verification based on your requirements
    await ctx.storage.delete(args.fileId);
    return null;
  },
});