import { v } from "convex/values";
import { getUsersByUserIds } from "../lib/auth";
import { facultyMutation, facultyQuery } from "../lib/functions";

/**
 * List announcements for a course
 * Faculty only
 */
export const listAnnouncements = facultyQuery({
  args: {
    courseId: v.id("courses"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("announcements"),
      _creationTime: v.number(),
      courseId: v.optional(v.id("courses")),
      authorId: v.string(),
      authorName: v.string(),
      title: v.string(),
      content: v.string(),
      isPinned: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    const limit = args.limit ?? 50;

    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(limit);

    // Enrich with author names (batched)
    const authorIds = Array.from(new Set(announcements.map((a) => a.authorId)));
    const authors = await getUsersByUserIds(ctx, authorIds);
    const authorMap = new Map(authors.filter(Boolean).map((u: any) => [u.userId, u]));

    const enriched = announcements.map((announcement) => ({
      _id: announcement._id,
      _creationTime: announcement._creationTime,
      courseId: announcement.courseId,
      authorId: announcement.authorId,
      authorName: authorMap.get(announcement.authorId)?.name ?? "Unknown",
      title: announcement.title,
      content: announcement.content,
      isPinned: announcement.isPinned,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
    }));

    // Sort: pinned first, then by creation time
    return enriched.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
  },
});

/**
 * Create announcement
 * Faculty only
 */
export const createAnnouncement = facultyMutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    isPinned: v.optional(v.boolean()),
  },
  returns: v.id("announcements"),
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    // Check access
    if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
      throw new Error("Access denied. You are not the assigned teacher for this course.");
    }

    const now = Date.now();

    const announcementId = await ctx.db.insert("announcements", {
      courseId: args.courseId,
      authorId: ctx.user.userId as string,
      title: args.title,
      content: args.content,
      isPinned: args.isPinned ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return announcementId;
  },
});

/**
 * Update announcement
 * Faculty only
 */
export const updateAnnouncement = facultyMutation({
  args: {
    announcementId: v.id("announcements"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // If course-specific, check access to course
    if (announcement.courseId) {
      const course = await ctx.db.get(announcement.courseId);

      if (!course) {
        throw new Error("Parent course not found");
      }

      // Check access
      if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
        throw new Error("Access denied. You are not the assigned teacher for this course.");
      }
    } else {
      // Global announcement - only admin can modify
      if (ctx.user.role !== "ADMIN") {
        throw new Error("Only admins can modify global announcements");
      }
    }

    // Build update object
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;

    await ctx.db.patch(args.announcementId, updates);

    return null;
  },
});

/**
 * Delete announcement
 * Faculty only
 */
export const deleteAnnouncement = facultyMutation({
  args: { announcementId: v.id("announcements") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // If course-specific, check access to course
    if (announcement.courseId) {
      const course = await ctx.db.get(announcement.courseId);

      if (!course) {
        throw new Error("Parent course not found");
      }

      // Check access
      if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
        throw new Error("Access denied. You are not the assigned teacher for this course.");
      }
    } else {
      // Global announcement - only admin can delete
      if (ctx.user.role !== "ADMIN") {
        throw new Error("Only admins can delete global announcements");
      }
    }

    await ctx.db.delete(args.announcementId);

    return null;
  },
});

/**
 * Pin/unpin announcement
 * Faculty only
 */
export const pinAnnouncement = facultyMutation({
  args: {
    announcementId: v.id("announcements"),
    isPinned: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const announcement = await ctx.db.get(args.announcementId);

    if (!announcement) {
      throw new Error("Announcement not found");
    }

    // If course-specific, check access to course
    if (announcement.courseId) {
      const course = await ctx.db.get(announcement.courseId);

      if (!course) {
        throw new Error("Parent course not found");
      }

      // Check access
      if (ctx.user.role !== "ADMIN" && course.teacherId !== ctx.user.userId) {
        throw new Error("Access denied. You are not the assigned teacher for this course.");
      }
    } else {
      // Global announcement - only admin can pin/unpin
      if (ctx.user.role !== "ADMIN") {
        throw new Error("Only admins can pin/unpin global announcements");
      }
    }

    await ctx.db.patch(args.announcementId, {
      isPinned: args.isPinned,
      updatedAt: Date.now(),
    });

    return null;
  },
});