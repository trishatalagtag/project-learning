import { v } from "convex/values";
import { query } from "../_generated/server";
import { createUserMap, getCurrentAuthUser, isFacultyOrAdmin, normalizeUserId } from "../lib/auth";

/**
 * Get global announcements (platform-wide)
 * Public - anyone can see global announcements
 */
export const getGlobalAnnouncements = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("announcements"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      isPinned: v.boolean(),
      authorId: v.string(),
      authorName: v.string(), // populated from user
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // get global announcements (courseId is null)
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_course", (q) => q.eq("courseId", undefined))
      .order("desc")
      .take(limit);

    // populate author names
    const withAuthors = await Promise.all(
      announcements.map(async (announcement) => {
        // get author from Better Auth user table (via component)
        const author = await ctx.db
          .query("users" as any) // better auth user table
          .filter((q: any) => q.eq(q.field("id"), announcement.authorId))
          .first();

        return {
          ...announcement,
          authorName: author?.name ?? "Unknown",
        };
      })
    );

    // sort: pinned first, then by creation time
    return withAuthors.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
  },
});

/**
 * Get course-specific announcements
 * Only enrolled learners + faculty/admin can see
 */
export const getCourseAnnouncements = query({
  args: {
    courseId: v.id("courses"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("announcements"),
      _creationTime: v.number(),
      courseId: v.optional(v.id("courses")),
      title: v.string(),
      content: v.string(),
      isPinned: v.boolean(),
      authorId: v.string(),
      authorName: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    // Check if user is enrolled or is faculty/admin
    const user = await getCurrentAuthUser(ctx);
    if (user) {
      const userId = normalizeUserId(user);
      if (userId) {
        const [enrollment, isFaculty] = await Promise.all([
          ctx.db
            .query("enrollments")
            .withIndex("by_user_and_course", (q) => q.eq("userId", userId).eq("courseId", args.courseId))
            .first(),
          isFacultyOrAdmin(ctx),
        ]);

        if (!enrollment && !isFaculty) {
          throw new Error("You are not enrolled in this course and are not authorized to view announcements");
        }
      }
    }

    // get course announcements
    const announcements = await ctx.db
      .query("announcements")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(limit);

    // Batch load author names
    const authorIds = [...new Set(announcements.map((a) => a.authorId))];
    const authorMap = await createUserMap(ctx, authorIds);

    const withAuthors = announcements.map((announcement) => {
      const author = authorMap.get(announcement.authorId);
      return {
        ...announcement,
        authorName: author?.name ?? "Unknown",
      };
    });

    // sort: pinned first, then by creation time
    return withAuthors.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
  },
});