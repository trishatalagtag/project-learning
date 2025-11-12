import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { createUserMap } from "../lib/auth";
import { adminMutation, adminQuery, facultyMutation } from "../lib/functions";
import {
  validateLessonStatus,
  validateModuleStatus,
  type ContentStatus,
} from "../lib/status_validation";

/**
 * Helper: Create audit log entry
 */
async function createAuditLog(
  ctx: any,
  contentType: "course" | "module" | "lesson" | "quiz" | "assignment",
  contentId: string,
  action: "created" | "submitted_for_review" | "approved" | "rejected" | "changes_requested" | "published" | "unpublished",
  previousStatus?: string,
  newStatus?: string,
  comments?: string
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return;

  await ctx.db.insert("auditLogs", {
    contentType,
    contentId,
    action,
    performedBy: identity.subject,
    performedByName: identity.name,
    previousStatus,
    newStatus,
    comments,
    timestamp: Date.now(),
  });
}

/**
 * Helper: Create notification for user
 */
async function createNotification(
  ctx: any,
  userId: string,
  type: "content_approved" | "content_rejected" | "content_published" | "pending_review",
  title: string,
  message: string,
  contentType?: string,
  contentId?: string,
  actionUrl?: string
) {
  await ctx.db.insert("notifications", {
    userId,
    type,
    title,
    message,
    contentType,
    contentId,
    actionUrl,
    isRead: false,
    createdAt: Date.now(),
  });
}

/**
 * List content paginated by type and status
 * Admin only - for approval workflow
 */
export const listContentPaginated = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("draft")
    ),
    contentType: v.union(
      v.literal("course"),
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.string(),
        _creationTime: v.number(),
        type: v.union(
          v.literal("course"),
          v.literal("module"),
          v.literal("lesson"),
          v.literal("quiz"),
          v.literal("assignment")
        ),
        title: v.string(),
        description: v.optional(v.string()),
        createdByName: v.string(),
        courseName: v.optional(v.string()),
        status: v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("draft"),
          v.literal("published"),
          v.literal("archived")
        ),
        createdAt: v.number(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {

    // Query based on contentType
    if (args.contentType === "course") {
      const courses = await ctx.db
        .query("courses")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .paginate(args.paginationOpts);

      // Batch fetch creators
      const creatorIds = courses.page.map((c) => c.createdBy);
      const creatorMap = await createUserMap(ctx, creatorIds);

      // Batch fetch categories for course names (courses don't have courseName)
      const categoryIds = [...new Set(courses.page.map((c) => c.categoryId))];
      const categories = await Promise.all(
        categoryIds.map((id) => ctx.db.get(id))
      );
      const categoryMap = new Map(
        categories.filter(Boolean).map((c) => [c!._id, c!])
      );

      return {
        page: courses.page.map((c) => {
          const creator = creatorMap.get(c.createdBy);
          const category = categoryMap.get(c.categoryId);
          return {
            _id: c._id,
            _creationTime: c._creationTime ?? c.createdAt,
            type: "course" as const,
            title: c.title,
            description: c.description,
            createdByName: creator?.name ?? "Unknown",
            courseName: category?.name,
            status: c.status as "pending" | "approved" | "draft" | "published" | "archived",
            createdAt: c.createdAt,
          };
        }),
        isDone: courses.isDone,
        continueCursor: courses.continueCursor,
      };
    } else if (args.contentType === "module") {
      const modules = await ctx.db
        .query("modules")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .paginate(args.paginationOpts);

      // Batch fetch creators and courses
      const creatorIds = modules.page.map((m) => m.createdBy);
      const creatorMap = await createUserMap(ctx, creatorIds);

      const courseIds = [...new Set(modules.page.map((m) => m.courseId))];
      const courses = await Promise.all(
        courseIds.map((id) => ctx.db.get(id))
      );
      const courseMap = new Map(
        courses.filter(Boolean).map((c) => [c!._id, c!])
      );

      return {
        page: modules.page.map((m) => {
          const creator = creatorMap.get(m.createdBy);
          const course = courseMap.get(m.courseId);
          return {
            _id: m._id,
            _creationTime: m._creationTime ?? m.createdAt,
            type: "module" as const,
            title: m.title,
            description: m.description,
            createdByName: creator?.name ?? "Unknown",
            courseName: course?.title,
            status: m.status as "pending" | "approved" | "draft" | "published" | "archived",
            createdAt: m.createdAt,
          };
        }),
        isDone: modules.isDone,
        continueCursor: modules.continueCursor,
      };
    } else if (args.contentType === "lesson") {
      const lessons = await ctx.db
        .query("lessons")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .paginate(args.paginationOpts);

      // Batch fetch creators, modules, and courses
      const creatorIds = lessons.page.map((l) => l.createdBy);
      const creatorMap = await createUserMap(ctx, creatorIds);

      const moduleIds = [...new Set(lessons.page.map((l) => l.moduleId))];
      const modules = await Promise.all(
        moduleIds.map((id) => ctx.db.get(id))
      );
      const moduleMap = new Map(
        modules.filter(Boolean).map((m) => [m!._id, m!])
      );

      const courseIds = [
        ...new Set(
          modules
            .filter(Boolean)
            .map((m) => m!.courseId)
            .filter(Boolean)
        ),
      ];
      const courses = await Promise.all(
        courseIds.map((id) => ctx.db.get(id))
      );
      const courseMap = new Map(
        courses.filter(Boolean).map((c) => [c!._id, c!])
      );

      return {
        page: lessons.page.map((l) => {
          const creator = creatorMap.get(l.createdBy);
          const module = moduleMap.get(l.moduleId);
          const course = module ? courseMap.get(module.courseId) : null;
          return {
            _id: l._id,
            _creationTime: l._creationTime ?? l.createdAt,
            type: "lesson" as const,
            title: l.title,
            description: l.description,
            createdByName: creator?.name ?? "Unknown",
            courseName: course?.title,
            status: l.status as "pending" | "approved" | "draft" | "published" | "archived",
            createdAt: l.createdAt,
          };
        }),
        isDone: lessons.isDone,
        continueCursor: lessons.continueCursor,
      };
    } else if (args.contentType === "quiz") {
      const quizzes = await ctx.db
        .query("quizzes")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .paginate(args.paginationOpts);

      // Batch fetch creators and courses
      const creatorIds = quizzes.page.map((q) => q.createdBy);
      const creatorMap = await createUserMap(ctx, creatorIds);

      const courseIds = [...new Set(quizzes.page.map((q) => q.courseId))];
      const courses = await Promise.all(
        courseIds.map((id) => ctx.db.get(id))
      );
      const courseMap = new Map(
        courses.filter(Boolean).map((c) => [c!._id, c!])
      );

      return {
        page: quizzes.page.map((q) => {
          const creator = creatorMap.get(q.createdBy);
          const course = courseMap.get(q.courseId);
          return {
            _id: q._id,
            _creationTime: q._creationTime ?? q.createdAt,
            type: "quiz" as const,
            title: q.title,
            description: q.description,
            createdByName: creator?.name ?? "Unknown",
            courseName: course?.title,
            status: q.status as "pending" | "approved" | "draft" | "published" | "archived",
            createdAt: q.createdAt,
          };
        }),
        isDone: quizzes.isDone,
        continueCursor: quizzes.continueCursor,
      };
    } else {
      // assignment
      const assignments = await ctx.db
        .query("assignments")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .paginate(args.paginationOpts);

      // Batch fetch creators and courses
      const creatorIds = assignments.page.map((a) => a.createdBy);
      const creatorMap = await createUserMap(ctx, creatorIds);

      const courseIds = [...new Set(assignments.page.map((a) => a.courseId))];
      const courses = await Promise.all(
        courseIds.map((id) => ctx.db.get(id))
      );
      const courseMap = new Map(
        courses.filter(Boolean).map((c) => [c!._id, c!])
      );

      return {
        page: assignments.page.map((a) => {
          const creator = creatorMap.get(a.createdBy);
          const course = courseMap.get(a.courseId);
          return {
            _id: a._id,
            _creationTime: a._creationTime ?? a.createdAt,
            type: "assignment" as const,
            title: a.title,
            description: a.description,
            createdByName: creator?.name ?? "Unknown",
            courseName: course?.title,
            status: a.status as "pending" | "approved" | "draft" | "published" | "archived",
            createdAt: a.createdAt,
          };
        }),
        isDone: assignments.isDone,
        continueCursor: assignments.continueCursor,
      };
    }
  },
});

/**
 * Get content counts by type and status
 * Admin only - for approval workflow
 */
/**
 * Get content counts by type and status
 * Admin only - for approval workflow
 */
export const getContentCounts = adminQuery({
  args: {
    contentType: v.union(
      v.literal("course"),
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
  },
  returns: v.object({
    pending: v.number(),
    approved: v.number(),
    rejected: v.number(),
  }),
  handler: async (ctx, args) => {
    // Map contentType to table name
    const tableMap: Record<
      "course" | "module" | "lesson" | "quiz" | "assignment",
      "courses" | "modules" | "lessons" | "quizzes" | "assignments"
    > = {
      course: "courses",
      module: "modules",
      lesson: "lessons",
      quiz: "quizzes",
      assignment: "assignments",
    };

    const table = tableMap[args.contentType];

    // Fetch all items from the table once and count in memory
    const allItems = await ctx.db
      .query(table)
      .collect();

    // Count by status in memory
    const pending = allItems.filter((item) => item.status === "pending").length;
    const approved = allItems.filter((item) => item.status === "approved").length;
    const rejected = allItems.filter(
      (item) => item.status === "draft" && item.updatedAt > item.createdAt
    ).length;

    return {
      pending,
      approved,
      rejected,
    };
  },
});

/**
 * List all approved content (modules, lessons, quizzes, assignments)
 * Admin only - for approval workflow
 */
export const listApprovedContent = adminQuery({
  args: {
    contentType: v.optional(
      v.union(
        v.literal("module"),
        v.literal("lesson"),
        v.literal("quiz"),
        v.literal("assignment")
      )
    ),
    courseId: v.optional(v.id("courses")),
  },
  returns: v.object({
    modules: v.array(
      v.object({
        _id: v.id("modules"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    lessons: v.array(
      v.object({
        _id: v.id("lessons"),
        title: v.string(),
        moduleId: v.id("modules"),
        moduleName: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    quizzes: v.array(
      v.object({
        _id: v.id("quizzes"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        linkedToLessonId: v.optional(v.id("lessons")),
        linkedToModuleId: v.optional(v.id("modules")),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    assignments: v.array(
      v.object({
        _id: v.id("assignments"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        linkedToLessonId: v.optional(v.id("lessons")),
        linkedToModuleId: v.optional(v.id("modules")),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const shouldFetch = (type: string) =>
      !args.contentType || args.contentType === type;

    // Fetch approved modules
    const modules = shouldFetch("module")
      ? await ctx.db
          .query("modules")
          .filter((q) => q.eq(q.field("status"), "approved"))
          .collect()
      : [];

    // Fetch approved lessons
    const lessons = shouldFetch("lesson")
      ? await ctx.db
          .query("lessons")
          .filter((q) => q.eq(q.field("status"), "approved"))
          .collect()
      : [];

    // Fetch approved quizzes
    const quizzes = shouldFetch("quiz")
      ? await ctx.db
          .query("quizzes")
          .withIndex("by_status", (q) => q.eq("status", "approved"))
          .collect()
      : [];

    // Fetch approved assignments
    const assignments = shouldFetch("assignment")
      ? await ctx.db
          .query("assignments")
          .withIndex("by_status", (q) => q.eq("status", "approved"))
          .collect()
      : [];

    // Filter by courseId if provided
    const filteredModules = args.courseId
      ? modules.filter((m) => m.courseId === args.courseId)
      : modules;

    const filteredQuizzes = args.courseId
      ? quizzes.filter((q) => q.courseId === args.courseId)
      : quizzes;

    const filteredAssignments = args.courseId
      ? assignments.filter((a) => a.courseId === args.courseId)
      : assignments;

    // For lessons, need to check module's courseId - batch load modules first
    let filteredLessons = lessons;
    if (args.courseId) {
      const lessonModuleIds = [...new Set(lessons.map((l) => l.moduleId))];
      const lessonModules = await Promise.all(lessonModuleIds.map((id) => ctx.db.get(id)));
      const lessonModuleMap = new Map(lessonModules.filter(Boolean).map((m) => [m!._id, m!]));
      filteredLessons = lessons.filter((lesson) => {
        const module = lessonModuleMap.get(lesson.moduleId);
        return module && module.courseId === args.courseId;
      });
    }

    // Batch load all creators
    const allCreatorIds = [
      ...filteredModules.map((m) => m.createdBy),
      ...filteredLessons.map((l) => l.createdBy),
      ...filteredQuizzes.map((q) => q.createdBy),
      ...filteredAssignments.map((a) => a.createdBy),
    ];
    const creatorMap = await createUserMap(ctx, [...new Set(allCreatorIds)]);

    // Batch load all courses
    const courseIds = [
      ...new Set([
        ...filteredModules.map((m) => m.courseId),
        ...filteredQuizzes.map((q) => q.courseId),
        ...filteredAssignments.map((a) => a.courseId),
      ]),
    ];
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
    const courseMap = new Map(courses.filter(Boolean).map((c) => [c!._id, c!]));

    // Batch load modules for lessons
    const moduleIds = [...new Set(filteredLessons.map((l) => l.moduleId))];
    const modulesForLessons = await Promise.all(moduleIds.map((id) => ctx.db.get(id)));
    const moduleMap = new Map(modulesForLessons.filter(Boolean).map((m) => [m!._id, m!]));

    // Enrich modules
    const enrichedModules = filteredModules.map((module) => {
      const course = courseMap.get(module.courseId);
      const creator = creatorMap.get(module.createdBy);
      return {
        _id: module._id,
        title: module.title,
        courseId: module.courseId,
        courseName: course?.title ?? "Unknown",
        createdBy: module.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      };
    });

    // Enrich lessons
    const enrichedLessons = filteredLessons.map((lesson) => {
      const module = moduleMap.get(lesson.moduleId);
      const course = module ? courseMap.get(module.courseId) : null;
      const creator = creatorMap.get(lesson.createdBy);
      return {
        _id: lesson._id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        moduleName: module?.title ?? "Unknown",
        courseId: module?.courseId ?? ("" as Id<"courses">),
        courseName: course?.title ?? "Unknown",
        createdBy: lesson.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      };
    });

    // Enrich quizzes
    const enrichedQuizzes = filteredQuizzes.map((quiz) => {
      const course = courseMap.get(quiz.courseId);
      const creator = creatorMap.get(quiz.createdBy);
      return {
        _id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        courseName: course?.title ?? "Unknown",
        linkedToLessonId: quiz.linkedToLessonId,
        linkedToModuleId: quiz.linkedToModuleId,
        createdBy: quiz.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };
    });

    // Enrich assignments
    const enrichedAssignments = filteredAssignments.map((assignment) => {
      const course = courseMap.get(assignment.courseId);
      const creator = creatorMap.get(assignment.createdBy);
      return {
        _id: assignment._id,
        title: assignment.title,
        courseId: assignment.courseId,
        courseName: course?.title ?? "Unknown",
        linkedToLessonId: assignment.linkedToLessonId,
        linkedToModuleId: assignment.linkedToModuleId,
        createdBy: assignment.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };
    });

    return {
      modules: enrichedModules,
      lessons: enrichedLessons,
      quizzes: enrichedQuizzes,
      assignments: enrichedAssignments,
    };
  },
});

/**
 * List all rejected content (draft content that was updated after creation)
 * Admin only - for approval workflow
 */
export const listRejectedContent = adminQuery({
  args: {
    contentType: v.optional(
      v.union(
        v.literal("module"),
        v.literal("lesson"),
        v.literal("quiz"),
        v.literal("assignment")
      )
    ),
    courseId: v.optional(v.id("courses")),
  },
  returns: v.object({
    modules: v.array(
      v.object({
        _id: v.id("modules"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    lessons: v.array(
      v.object({
        _id: v.id("lessons"),
        title: v.string(),
        moduleId: v.id("modules"),
        moduleName: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    quizzes: v.array(
      v.object({
        _id: v.id("quizzes"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        linkedToLessonId: v.optional(v.id("lessons")),
        linkedToModuleId: v.optional(v.id("modules")),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    assignments: v.array(
      v.object({
        _id: v.id("assignments"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        linkedToLessonId: v.optional(v.id("lessons")),
        linkedToModuleId: v.optional(v.id("modules")),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const shouldFetch = (type: string) =>
      !args.contentType || args.contentType === type;

    // Fetch draft modules that were updated after creation (likely rejected)
    const allDraftModules = shouldFetch("module")
      ? await ctx.db
          .query("modules")
          .filter((q) => q.eq(q.field("status"), "draft"))
          .collect()
      : [];
    const modules = allDraftModules.filter((m) => m.updatedAt > m.createdAt);

    // Fetch draft lessons that were updated after creation
    const allDraftLessons = shouldFetch("lesson")
      ? await ctx.db
          .query("lessons")
          .filter((q) => q.eq(q.field("status"), "draft"))
          .collect()
      : [];
    const lessons = allDraftLessons.filter((l) => l.updatedAt > l.createdAt);

    // Fetch draft quizzes that were updated after creation
    const allDraftQuizzes = shouldFetch("quiz")
      ? await ctx.db
          .query("quizzes")
          .withIndex("by_status", (q) => q.eq("status", "draft"))
          .collect()
      : [];
    const quizzes = allDraftQuizzes.filter((q) => q.updatedAt > q.createdAt);

    // Fetch draft assignments that were updated after creation
    const allDraftAssignments = shouldFetch("assignment")
      ? await ctx.db
          .query("assignments")
          .withIndex("by_status", (q) => q.eq("status", "draft"))
          .collect()
      : [];
    const assignments = allDraftAssignments.filter((a) => a.updatedAt > a.createdAt);

    // Sort by updatedAt descending
    modules.sort((a, b) => b.updatedAt - a.updatedAt);
    lessons.sort((a, b) => b.updatedAt - a.updatedAt);
    quizzes.sort((a, b) => b.updatedAt - a.updatedAt);
    assignments.sort((a, b) => b.updatedAt - a.updatedAt);

    // Filter by courseId if provided
    const filteredModules = args.courseId
      ? modules.filter((m) => m.courseId === args.courseId)
      : modules;

    const filteredQuizzes = args.courseId
      ? quizzes.filter((q) => q.courseId === args.courseId)
      : quizzes;

    const filteredAssignments = args.courseId
      ? assignments.filter((a) => a.courseId === args.courseId)
      : assignments;

    // For lessons, need to check module's courseId - batch load modules first
    let filteredLessons = lessons;
    if (args.courseId) {
      const lessonModuleIds = [...new Set(lessons.map((l) => l.moduleId))];
      const lessonModules = await Promise.all(lessonModuleIds.map((id) => ctx.db.get(id)));
      const lessonModuleMap = new Map(lessonModules.filter(Boolean).map((m) => [m!._id, m!]));
      filteredLessons = lessons.filter((lesson) => {
        const module = lessonModuleMap.get(lesson.moduleId);
        return module && module.courseId === args.courseId;
      });
    }

    // Batch load all creators
    const allCreatorIds = [
      ...filteredModules.map((m) => m.createdBy),
      ...filteredLessons.map((l) => l.createdBy),
      ...filteredQuizzes.map((q) => q.createdBy),
      ...filteredAssignments.map((a) => a.createdBy),
    ];
    const creatorMap = await createUserMap(ctx, [...new Set(allCreatorIds)]);

    // Batch load all courses
    const courseIds = [
      ...new Set([
        ...filteredModules.map((m) => m.courseId),
        ...filteredQuizzes.map((q) => q.courseId),
        ...filteredAssignments.map((a) => a.courseId),
      ]),
    ];
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
    const courseMap = new Map(courses.filter(Boolean).map((c) => [c!._id, c!]));

    // Batch load modules for lessons
    const moduleIds = [...new Set(filteredLessons.map((l) => l.moduleId))];
    const modulesForLessons = await Promise.all(moduleIds.map((id) => ctx.db.get(id)));
    const moduleMap = new Map(modulesForLessons.filter(Boolean).map((m) => [m!._id, m!]));

    // Enrich modules
    const enrichedModules = filteredModules.map((module) => {
      const course = courseMap.get(module.courseId);
      const creator = creatorMap.get(module.createdBy);
      return {
        _id: module._id,
        title: module.title,
        courseId: module.courseId,
        courseName: course?.title ?? "Unknown",
        createdBy: module.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      };
    });

    // Enrich lessons
    const enrichedLessons = filteredLessons.map((lesson) => {
      const module = moduleMap.get(lesson.moduleId);
      const course = module ? courseMap.get(module.courseId) : null;
      const creator = creatorMap.get(lesson.createdBy);
      return {
        _id: lesson._id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        moduleName: module?.title ?? "Unknown",
        courseId: module?.courseId ?? ("" as Id<"courses">),
        courseName: course?.title ?? "Unknown",
        createdBy: lesson.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      };
    });

    // Enrich quizzes
    const enrichedQuizzes = filteredQuizzes.map((quiz) => {
      const course = courseMap.get(quiz.courseId);
      const creator = creatorMap.get(quiz.createdBy);
      return {
        _id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        courseName: course?.title ?? "Unknown",
        linkedToLessonId: quiz.linkedToLessonId,
        linkedToModuleId: quiz.linkedToModuleId,
        createdBy: quiz.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };
    });

    // Enrich assignments
    const enrichedAssignments = filteredAssignments.map((assignment) => {
      const course = courseMap.get(assignment.courseId);
      const creator = creatorMap.get(assignment.createdBy);
      return {
        _id: assignment._id,
        title: assignment.title,
        courseId: assignment.courseId,
        courseName: course?.title ?? "Unknown",
        linkedToLessonId: assignment.linkedToLessonId,
        linkedToModuleId: assignment.linkedToModuleId,
        createdBy: assignment.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      };
    });

    return {
      modules: enrichedModules,
      lessons: enrichedLessons,
      quizzes: enrichedQuizzes,
      assignments: enrichedAssignments,
    };
  },
});

/**
 * List all pending content (modules, lessons, quizzes, assignments)
 * Admin only - for approval workflow
 */
export const listPendingContent = adminQuery({
  args: {
    contentType: v.optional(
      v.union(
        v.literal("module"),
        v.literal("lesson"),
        v.literal("quiz"),
        v.literal("assignment")
      )
    ),
    courseId: v.optional(v.id("courses")),
  },
  returns: v.object({
    modules: v.array(
      v.object({
        _id: v.id("modules"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
      })
    ),
    lessons: v.array(
      v.object({
        _id: v.id("lessons"),
        title: v.string(),
        moduleId: v.id("modules"),
        moduleName: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
      })
    ),
    quizzes: v.array(
      v.object({
        _id: v.id("quizzes"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        linkedToLessonId: v.optional(v.id("lessons")),
        linkedToModuleId: v.optional(v.id("modules")),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
      })
    ),
    assignments: v.array(
      v.object({
        _id: v.id("assignments"),
        title: v.string(),
        courseId: v.id("courses"),
        courseName: v.string(),
        linkedToLessonId: v.optional(v.id("lessons")),
        linkedToModuleId: v.optional(v.id("modules")),
        createdBy: v.string(),
        createdByName: v.string(),
        createdAt: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const shouldFetch = (type: string) =>
      !args.contentType || args.contentType === type;

    // Fetch pending modules
    const modules = shouldFetch("module")
      ? await ctx.db
          .query("modules")
          .filter((q) => q.eq(q.field("status"), "pending"))
          .collect()
      : [];

    // Fetch pending lessons
    const lessons = shouldFetch("lesson")
      ? await ctx.db
          .query("lessons")
          .filter((q) => q.eq(q.field("status"), "pending"))
          .collect()
      : [];

    // Fetch pending quizzes
    const quizzes = shouldFetch("quiz")
      ? await ctx.db
          .query("quizzes")
          .withIndex("by_status", (q) => q.eq("status", "pending"))
          .collect()
      : [];

    // Fetch pending assignments
    const assignments = shouldFetch("assignment")
      ? await ctx.db
          .query("assignments")
          .withIndex("by_status", (q) => q.eq("status", "pending"))
          .collect()
      : [];

    // Filter by courseId if provided
    const filteredModules = args.courseId
      ? modules.filter((m) => m.courseId === args.courseId)
      : modules;

    const filteredQuizzes = args.courseId
      ? quizzes.filter((q) => q.courseId === args.courseId)
      : quizzes;

    const filteredAssignments = args.courseId
      ? assignments.filter((a) => a.courseId === args.courseId)
      : assignments;

    // For lessons, need to check module's courseId - batch load modules first
    let filteredLessons = lessons;
    if (args.courseId) {
      const lessonModuleIds = [...new Set(lessons.map((l) => l.moduleId))];
      const lessonModules = await Promise.all(lessonModuleIds.map((id) => ctx.db.get(id)));
      const lessonModuleMap = new Map(lessonModules.filter(Boolean).map((m) => [m!._id, m!]));
      filteredLessons = lessons.filter((lesson) => {
        const module = lessonModuleMap.get(lesson.moduleId);
        return module && module.courseId === args.courseId;
      });
    }

    // Batch load all creators
    const allCreatorIds = [
      ...filteredModules.map((m) => m.createdBy),
      ...filteredLessons.map((l) => l.createdBy),
      ...filteredQuizzes.map((q) => q.createdBy),
      ...filteredAssignments.map((a) => a.createdBy),
    ];
    const creatorMap = await createUserMap(ctx, [...new Set(allCreatorIds)]);

    // Batch load all courses
    const courseIds = [
      ...new Set([
        ...filteredModules.map((m) => m.courseId),
        ...filteredQuizzes.map((q) => q.courseId),
        ...filteredAssignments.map((a) => a.courseId),
      ]),
    ];
    const courses = await Promise.all(courseIds.map((id) => ctx.db.get(id)));
    const courseMap = new Map(courses.filter(Boolean).map((c) => [c!._id, c!]));

    // Batch load modules for lessons
    const moduleIds = [...new Set(filteredLessons.map((l) => l.moduleId))];
    const modulesForLessons = await Promise.all(moduleIds.map((id) => ctx.db.get(id)));
    const moduleMap = new Map(modulesForLessons.filter(Boolean).map((m) => [m!._id, m!]));

    // Enrich modules
    const enrichedModules = filteredModules.map((module) => {
      const course = courseMap.get(module.courseId);
      const creator = creatorMap.get(module.createdBy);
      return {
        _id: module._id,
        title: module.title,
        courseId: module.courseId,
        courseName: course?.title ?? "Unknown",
        createdBy: module.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: module.createdAt,
      };
    });

    // Enrich lessons
    const enrichedLessons = filteredLessons.map((lesson) => {
      const module = moduleMap.get(lesson.moduleId);
      const course = module ? courseMap.get(module.courseId) : null;
      const creator = creatorMap.get(lesson.createdBy);
      return {
        _id: lesson._id,
        title: lesson.title,
        moduleId: lesson.moduleId,
        moduleName: module?.title ?? "Unknown",
        courseId: module?.courseId ?? ("" as Id<"courses">),
        courseName: course?.title ?? "Unknown",
        createdBy: lesson.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: lesson.createdAt,
      };
    });

    // Enrich quizzes
    const enrichedQuizzes = filteredQuizzes.map((quiz) => {
      const course = courseMap.get(quiz.courseId);
      const creator = creatorMap.get(quiz.createdBy);
      return {
        _id: quiz._id,
        title: quiz.title,
        courseId: quiz.courseId,
        courseName: course?.title ?? "Unknown",
        linkedToLessonId: quiz.linkedToLessonId,
        linkedToModuleId: quiz.linkedToModuleId,
        createdBy: quiz.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: quiz.createdAt,
      };
    });

    // Enrich assignments
    const enrichedAssignments = filteredAssignments.map((assignment) => {
      const course = courseMap.get(assignment.courseId);
      const creator = creatorMap.get(assignment.createdBy);
      return {
        _id: assignment._id,
        title: assignment.title,
        courseId: assignment.courseId,
        courseName: course?.title ?? "Unknown",
        linkedToLessonId: assignment.linkedToLessonId,
        linkedToModuleId: assignment.linkedToModuleId,
        createdBy: assignment.createdBy,
        createdByName: creator?.name ?? "Unknown",
        createdAt: assignment.createdAt,
      };
    });

    return {
      modules: enrichedModules,
      lessons: enrichedLessons,
      quizzes: enrichedQuizzes,
      assignments: enrichedAssignments,
    };
  },
});

/**
 * Approve module
 * Admin only
 */
export const approveModule = adminMutation({
  args: { moduleId: v.id("modules") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.moduleId);

    if (!module) {
      throw new Error("Module not found");
    }

    if (module.status !== "pending") {
      throw new Error("Only pending modules can be approved");
    }

    // Validate: check if any lessons have higher status than approved
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    validateModuleStatus("approved" as ContentStatus, lessons, module.title);

    await ctx.db.patch(args.moduleId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    // Audit log
    await createAuditLog(
      ctx,
      "module",
      args.moduleId,
      "approved",
      "pending",
      "approved"
    );

    return null;
  },
});

/**
 * Approve lesson
 * Admin only
 */
export const approveLesson = adminMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (lesson.status !== "pending") {
      throw new Error("Only pending lessons can be approved");
    }

    // Get parent module to validate status constraint
    const module = await ctx.db.get(lesson.moduleId);

    if (!module) {
      throw new Error("Parent module not found");
    }

    // Validate: lesson cannot be approved if module isn't approved
    validateLessonStatus(
      "approved" as ContentStatus,
      module.status as ContentStatus,
      lesson.title
    );

    await ctx.db.patch(args.lessonId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    // Audit log
    await createAuditLog(
      ctx,
      "lesson",
      args.lessonId,
      "approved",
      "pending",
      "approved"
    );

    return null;
  },
});

/**
 * Approve quiz
 * Admin only
 */
export const approveQuiz = adminMutation({
  args: { 
    quizId: v.id("quizzes"),
    comments: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (quiz.status !== "pending") {
      throw new Error("Only pending quizzes can be approved");
    }

    await ctx.db.patch(args.quizId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    // Audit log
    await createAuditLog(
      ctx,
      "quiz",
      args.quizId,
      "approved",
      "pending",
      "approved",
      args.comments
    );

    // Notify creator
    await createNotification(
      ctx,
      quiz.createdBy,
      "content_approved",
      "Quiz Approved",
      `Your quiz "${quiz.title}" has been approved.`,
      "quiz",
      args.quizId
    );

    return null;
  },
});

/**
 * Approve assignment
 * Admin only
 */
export const approveAssignment = adminMutation({
  args: { 
    assignmentId: v.id("assignments"),
    comments: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const assignment = await ctx.db.get(args.assignmentId);

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (assignment.status !== "pending") {
      throw new Error("Only pending assignments can be approved");
    }

    await ctx.db.patch(args.assignmentId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    // Audit log
    await createAuditLog(
      ctx,
      "assignment",
      args.assignmentId,
      "approved",
      "pending",
      "approved",
      args.comments
    );

    // Notify creator
    await createNotification(
      ctx,
      assignment.createdBy,
      "content_approved",
      "Assignment Approved",
      `Your assignment "${assignment.title}" has been approved.`,
      "assignment",
      args.assignmentId
    );

    return null;
  },
});

/**
 * Bulk approve multiple content items
 * Admin only - approves multiple items in one operation
 */
export const bulkApproveContent = adminMutation({
  args: {
    items: v.array(
      v.object({
        contentType: v.union(
          v.literal("module"),
          v.literal("lesson"),
          v.literal("quiz"),
          v.literal("assignment")
        ),
        contentId: v.string(),
      })
    ),
    comments: v.optional(v.string()),
  },
  returns: v.object({
    successful: v.number(),
    failed: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of args.items) {
      try {
        // Get the content to check status
        let content: any;

        if (item.contentType === "module") {
          content = await ctx.db.get(item.contentId as Id<"modules">);
          if (!content) throw new Error("Module not found");
          if (content.status !== "pending") {
            throw new Error("Only pending modules can be approved");
          }

          // Validate: check if any lessons have higher status than approved
          const lessons = await ctx.db
            .query("lessons")
            .withIndex("by_module", (q) => q.eq("moduleId", item.contentId as Id<"modules">))
            .collect();

          validateModuleStatus("approved" as ContentStatus, lessons, content.title);

          await ctx.db.patch(item.contentId as Id<"modules">, {
            status: "approved",
            updatedAt: Date.now(),
          });

          await createAuditLog(
            ctx,
            "module",
            item.contentId,
            "approved",
            "pending",
            "approved",
            args.comments
          );
        } else if (item.contentType === "lesson") {
          content = await ctx.db.get(item.contentId as Id<"lessons">);
          if (!content) throw new Error("Lesson not found");
          if (content.status !== "pending") {
            throw new Error("Only pending lessons can be approved");
          }

          // Get parent module to validate status constraint
          const module = await ctx.db.get(content.moduleId);
          if (!module || !("status" in module)) {
            throw new Error("Parent module not found");
          }

          // Validate: lesson cannot be approved if module isn't approved
          validateLessonStatus(
            "approved" as ContentStatus,
            (module as { status: string }).status as ContentStatus,
            content.title
          );

          await ctx.db.patch(item.contentId as Id<"lessons">, {
            status: "approved",
            updatedAt: Date.now(),
          });

          await createAuditLog(
            ctx,
            "lesson",
            item.contentId,
            "approved",
            "pending",
            "approved",
            args.comments
          );
        } else if (item.contentType === "quiz") {
          content = await ctx.db.get(item.contentId as Id<"quizzes">);
          if (!content) throw new Error("Quiz not found");
          if (content.status !== "pending") {
            throw new Error("Only pending quizzes can be approved");
          }

          await ctx.db.patch(item.contentId as Id<"quizzes">, {
            status: "approved",
            updatedAt: Date.now(),
          });

          await createAuditLog(
            ctx,
            "quiz",
            item.contentId,
            "approved",
            "pending",
            "approved",
            args.comments
          );

          await createNotification(
            ctx,
            content.createdBy,
            "content_approved",
            "Quiz Approved",
            `Your quiz "${content.title}" has been approved.`,
            "quiz",
            item.contentId
          );
        } else if (item.contentType === "assignment") {
          content = await ctx.db.get(item.contentId as Id<"assignments">);
          if (!content) throw new Error("Assignment not found");
          if (content.status !== "pending") {
            throw new Error("Only pending assignments can be approved");
          }

          await ctx.db.patch(item.contentId as Id<"assignments">, {
            status: "approved",
            updatedAt: Date.now(),
          });

          await createAuditLog(
            ctx,
            "assignment",
            item.contentId,
            "approved",
            "pending",
            "approved",
            args.comments
          );

          await createNotification(
            ctx,
            content.createdBy,
            "content_approved",
            "Assignment Approved",
            `Your assignment "${content.title}" has been approved.`,
            "assignment",
            item.contentId
          );
        }

        successful++;
      } catch (error) {
        failed++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${item.contentType} ${item.contentId}: ${errorMsg}`);
      }
    }

    return { successful, failed, errors };
  },
});

/**
 * Reject content with reason
 * Admin only - works for modules, lessons, quizzes, assignments
 */
export const rejectContent = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.union(
      v.id("modules"),
      v.id("lessons"),
      v.id("quizzes"),
      v.id("assignments")
    ),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    let content: { status: string; createdBy: string; title: string } | null = null;

    // Get content based on type
    switch (args.contentType) {
      case "module":
        content = await ctx.db.get(args.contentId as Id<"modules">);
        break;
      case "lesson":
        content = await ctx.db.get(args.contentId as Id<"lessons">);
        break;
      case "quiz":
        content = await ctx.db.get(args.contentId as Id<"quizzes">);
        break;
      case "assignment":
        content = await ctx.db.get(args.contentId as Id<"assignments">);
        break;
    }

    if (!content) {
      throw new Error(`${args.contentType} not found`);
    }

    if (content.status !== "pending") {
      throw new Error(`Only pending ${args.contentType}s can be rejected`);
    }

    const createdBy = content.createdBy;
    const contentTitle = content.title;

    // Set back to draft
    switch (args.contentType) {
      case "module":
        // Validate: check if any lessons have higher status than draft
        const module = await ctx.db.get(args.contentId as Id<"modules">);
        if (!module) {
          throw new Error("Module not found");
        }
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_module", (q) => q.eq("moduleId", args.contentId as Id<"modules">))
          .collect();

        validateModuleStatus("draft" as ContentStatus, lessons, module.title);

        await ctx.db.patch(args.contentId as Id<"modules">, {
          status: "draft",
          updatedAt: Date.now(),
        });
        break;
      case "lesson":
        // Rejecting to draft is always safe (going down, no parent check needed)
        await ctx.db.patch(args.contentId as Id<"lessons">, {
          status: "draft",
          updatedAt: Date.now(),
        });
        break;
      case "quiz":
        await ctx.db.patch(args.contentId as Id<"quizzes">, {
          status: "draft",
          updatedAt: Date.now(),
        });
        break;
      case "assignment":
        await ctx.db.patch(args.contentId as Id<"assignments">, {
          status: "draft",
          updatedAt: Date.now(),
        });
        break;
    }

    // Audit log
    await createAuditLog(
      ctx,
      args.contentType,
      args.contentId,
      "rejected",
      "pending",
      "draft",
      args.reason
    );

    // Notify creator
    await createNotification(
      ctx,
      createdBy,
      "content_rejected",
      `${args.contentType.charAt(0).toUpperCase() + args.contentType.slice(1)} Rejected`,
      `Your ${args.contentType} "${contentTitle}" was rejected. Reason: ${args.reason}`,
      args.contentType,
      args.contentId
    );

    return null;
  },
});

/**
 * Request changes on pending content
 * Admin only - sets status to changes_requested and notifies creator
 */
export const requestChanges = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    feedback: v.string(),
    issues: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get content based on type
    let content: { status: string; createdBy: string; title: string } | null = null;

    switch (args.contentType) {
      case "module":
        content = await ctx.db.get(args.contentId as Id<"modules">);
        break;
      case "lesson":
        content = await ctx.db.get(args.contentId as Id<"lessons">);
        break;
      case "quiz":
        content = await ctx.db.get(args.contentId as Id<"quizzes">);
        break;
      case "assignment":
        content = await ctx.db.get(args.contentId as Id<"assignments">);
        break;
    }

    if (!content) {
      throw new Error("Content not found");
    }

    if (content.status !== "pending") {
      throw new Error("Only pending content can have changes requested");
    }

    // Update status
    switch (args.contentType) {
      case "module":
        await ctx.db.patch(args.contentId as Id<"modules">, {
          status: "changes_requested",
          updatedAt: Date.now(),
        });
        break;
      case "lesson":
        await ctx.db.patch(args.contentId as Id<"lessons">, {
          status: "changes_requested",
          updatedAt: Date.now(),
        });
        break;
      case "quiz":
        await ctx.db.patch(args.contentId as Id<"quizzes">, {
          status: "changes_requested",
          updatedAt: Date.now(),
        });
        break;
      case "assignment":
        await ctx.db.patch(args.contentId as Id<"assignments">, {
          status: "changes_requested",
          updatedAt: Date.now(),
        });
        break;
    }

    // Audit log
    await createAuditLog(
      ctx,
      args.contentType,
      args.contentId,
      "changes_requested",
      "pending",
      "changes_requested",
      `Issues: ${args.issues.join(", ")}\n\nFeedback: ${args.feedback}`
    );

    // Notify creator with detailed feedback
    await createNotification(
      ctx,
      content.createdBy,
      "content_rejected",
      "Changes Requested",
      `Your ${args.contentType} "${content.title}" needs revisions. Please review the feedback and resubmit.`,
      args.contentType,
      args.contentId
    );

    return null;
  },
});

/**
 * Resubmit content after changes requested
 * Faculty only - changes status from changes_requested back to pending
 */
export const resubmitContent = facultyMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    revisionNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get content based on type
    let content: { status: string; createdBy: string; title: string } | null = null;

    switch (args.contentType) {
      case "module":
        content = await ctx.db.get(args.contentId as Id<"modules">);
        break;
      case "lesson":
        content = await ctx.db.get(args.contentId as Id<"lessons">);
        break;
      case "quiz":
        content = await ctx.db.get(args.contentId as Id<"quizzes">);
        break;
      case "assignment":
        content = await ctx.db.get(args.contentId as Id<"assignments">);
        break;
    }

    if (!content) {
      throw new Error("Content not found");
    }

    // Verify user is the creator
    if (content.createdBy !== ctx.user.userId && ctx.user.role !== "ADMIN") {
      throw new Error("Only the content creator can resubmit");
    }

    if (content.status !== "changes_requested") {
      throw new Error("Only content with requested changes can be resubmitted");
    }

    // Update to pending
    switch (args.contentType) {
      case "module":
        await ctx.db.patch(args.contentId as Id<"modules">, {
          status: "pending",
          updatedAt: Date.now(),
        });
        break;
      case "lesson":
        await ctx.db.patch(args.contentId as Id<"lessons">, {
          status: "pending",
          updatedAt: Date.now(),
        });
        break;
      case "quiz":
        await ctx.db.patch(args.contentId as Id<"quizzes">, {
          status: "pending",
          updatedAt: Date.now(),
        });
        break;
      case "assignment":
        await ctx.db.patch(args.contentId as Id<"assignments">, {
          status: "pending",
          updatedAt: Date.now(),
        });
        break;
    }

    // Audit log
    await createAuditLog(
      ctx,
      args.contentType,
      args.contentId,
      "submitted_for_review",
      "changes_requested",
      "pending",
      args.revisionNotes
    );

    // Notify admins - query admins using auth adapter
    const adminsResult = await ctx.runQuery(components.auth.adapter.findMany, {
      model: "user",
      where: [{ field: "role", operator: "eq", value: "ADMIN" }],
      limit: 100,
      offset: 0,
      paginationOpts: { cursor: null, numItems: 100 },
    });

    let admins: any[] = [];
    if (Array.isArray(adminsResult)) {
      admins = adminsResult;
    } else if (adminsResult && typeof adminsResult === "object") {
      admins = adminsResult.data ?? adminsResult.items ?? [];
    }

    for (const admin of admins) {
      const adminId = String(admin._id);
      await createNotification(
        ctx,
        adminId,
        "pending_review",
        "Content Resubmitted",
        `Content "${content.title}" has been resubmitted for review.`,
        args.contentType,
        args.contentId
      );
    }

    return null;
  },
});

/**
 * Publish lesson (approved → published)
 * Admin only - makes lesson visible to learners
 */
export const publishLesson = adminMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (lesson.status !== "approved") {
      throw new Error("Only approved lessons can be published");
    }

    // Get parent module to validate status constraint
    const module = await ctx.db.get(lesson.moduleId);

    if (!module) {
      throw new Error("Parent module not found");
    }

    // Module must be published for lesson to be published
    if (module.status !== "published") {
      throw new Error(
        `Cannot publish lesson. Parent module "${module.title}" must be published first.`
      );
    }

    await ctx.db.patch(args.lessonId, {
      status: "published",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Unpublish lesson (published → approved)
 * Admin only - hides lesson from learners
 */
export const unpublishLesson = adminMutation({
  args: { lessonId: v.id("lessons") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    if (lesson.status !== "published") {
      throw new Error("Only published lessons can be unpublished");
    }

    await ctx.db.patch(args.lessonId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Get counts for all content types
 */
export const getAllContentCounts = adminQuery({
  args: {
    courseId: v.optional(v.id("courses")),
  },
  returns: v.object({
    modules: v.object({ pending: v.number(), approved: v.number(), rejected: v.number() }),
    lessons: v.object({ pending: v.number(), approved: v.number(), rejected: v.number() }),
    quizzes: v.object({ pending: v.number(), approved: v.number(), rejected: v.number() }),
    assignments: v.object({ pending: v.number(), approved: v.number(), rejected: v.number() }),
    total: v.object({ pending: v.number(), approved: v.number(), rejected: v.number() }),
  }),
  handler: async (ctx, args) => {
    // Get modules counts
    const modulesQuery = args.courseId
      ? ctx.db.query("modules").withIndex("by_course", (q) => q.eq("courseId", args.courseId!))
      : ctx.db.query("modules");
    const modulesItems = await modulesQuery.collect();
    const modules = {
      pending: modulesItems.filter((item) => item.status === "pending").length,
      approved: modulesItems.filter((item) => item.status === "approved").length,
      rejected: modulesItems.filter(
        (item) => item.status === "draft" && item.updatedAt > item.createdAt
      ).length,
    };

    // Get lessons counts
    // Lessons don't have direct courseId, so we need to filter through modules
    let lessonsItems = await ctx.db.query("lessons").collect();
    if (args.courseId) {
      // Filter lessons by course through their modules
      const moduleIds = await ctx.db
        .query("modules")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId!))
        .collect();
      const moduleIdSet = new Set(moduleIds.map((m) => m._id));
      lessonsItems = lessonsItems.filter((l) => moduleIdSet.has(l.moduleId));
    }
    const lessons = {
      pending: lessonsItems.filter((item) => item.status === "pending").length,
      approved: lessonsItems.filter((item) => item.status === "approved").length,
      rejected: lessonsItems.filter(
        (item) => item.status === "draft" && item.updatedAt > item.createdAt
      ).length,
    };

    // Get quizzes counts
    const quizzesQuery = args.courseId
      ? ctx.db.query("quizzes").withIndex("by_course", (q) => q.eq("courseId", args.courseId!))
      : ctx.db.query("quizzes");
    const quizzesItems = await quizzesQuery.collect();
    const quizzes = {
      pending: quizzesItems.filter((item) => item.status === "pending").length,
      approved: quizzesItems.filter((item) => item.status === "approved").length,
      rejected: quizzesItems.filter(
        (item) => item.status === "draft" && item.updatedAt > item.createdAt
      ).length,
    };

    // Get assignments counts
    const assignmentsQuery = args.courseId
      ? ctx.db.query("assignments").withIndex("by_course", (q) => q.eq("courseId", args.courseId!))
      : ctx.db.query("assignments");
    const assignmentsItems = await assignmentsQuery.collect();
    const assignments = {
      pending: assignmentsItems.filter((item) => item.status === "pending").length,
      approved: assignmentsItems.filter((item) => item.status === "approved").length,
      rejected: assignmentsItems.filter(
        (item) => item.status === "draft" && item.updatedAt > item.createdAt
      ).length,
    };

    const total = {
      pending: modules.pending + lessons.pending + quizzes.pending + assignments.pending,
      approved: modules.approved + lessons.approved + quizzes.approved + assignments.approved,
      rejected: modules.rejected + lessons.rejected + quizzes.rejected + assignments.rejected,
    };

    return { modules, lessons, quizzes, assignments, total };
  },
});

/**
 * Get all pending content across types
 */
export const getAllPendingContent = adminQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    courseId: v.optional(v.id("courses")),
    createdBy: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    sortBy: v.optional(
      v.union(v.literal("newest"), v.literal("oldest"), v.literal("title"))
    ),
  },
  returns: v.object({
    page: v.array(
      v.object({
        _id: v.string(),
        type: v.string(),
        title: v.string(),
        courseName: v.optional(v.string()),
        courseId: v.optional(v.id("courses")),
        moduleName: v.optional(v.string()),
        createdBy: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        status: v.string(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const allItems = await Promise.all([
      ...modules.map(async (m) => {
        const course = await ctx.db.get(m.courseId);
        return {
          _id: m._id,
          type: "module",
          title: m.title,
          courseName: course?.title,
          courseId: m.courseId,
          moduleName: undefined,
          createdBy: m.createdBy,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          status: m.status,
        };
      }),
      ...lessons.map(async (l) => {
        const module = await ctx.db.get(l.moduleId);
        const course = module ? await ctx.db.get(module.courseId) : null;
        return {
          _id: l._id,
          type: "lesson",
          title: l.title,
          courseName: course?.title,
          courseId: module?.courseId,
          moduleName: module?.title,
          createdBy: l.createdBy,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
          status: l.status,
        };
      }),
      ...quizzes.map(async (q) => {
        const course = await ctx.db.get(q.courseId);
        return {
          _id: q._id,
          type: "quiz",
          title: q.title,
          courseName: course?.title,
          courseId: q.courseId,
          moduleName: undefined,
          createdBy: q.createdBy,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          status: q.status,
        };
      }),
      ...assignments.map(async (a) => {
        const course = await ctx.db.get(a.courseId);
        return {
          _id: a._id,
          type: "assignment",
          title: a.title,
          courseName: course?.title,
          courseId: a.courseId,
          moduleName: undefined,
          createdBy: a.createdBy,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          status: a.status,
        };
      }),
    ]);

    let filtered = allItems;

    if (args.courseId) {
      filtered = filtered.filter((item) => item.courseId === args.courseId);
    }

    if (args.createdBy) {
      filtered = filtered.filter((item) => item.createdBy === args.createdBy);
    }

    if (args.startDate) {
      filtered = filtered.filter((item) => item.createdAt >= args.startDate!);
    }

    if (args.endDate) {
      filtered = filtered.filter((item) => item.createdAt <= args.endDate!);
    }

    const sortBy = args.sortBy ?? "newest";
    if (sortBy === "oldest") {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    const { numItems } = args.paginationOpts;
    const page = filtered.slice(0, numItems);
    const isDone = filtered.length <= numItems;

    return {
      page,
      isDone,
      continueCursor: "",
    };
  },
});

/**
 * Update content status (for Kanban drag-and-drop)
 * Admin only - allows changing status between any valid states
 */
export const updateContentStatus = adminMutation({
  args: {
    contentType: v.union(
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
    newStatus: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("changes_requested"),
      v.literal("approved"),
      v.literal("published")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get content based on type
    let content: { status: string; createdBy: string; title: string } | null = null;
    let previousStatus: string = "";

    switch (args.contentType) {
      case "module":
        content = await ctx.db.get(args.contentId as Id<"modules">);
        if (content) {
          previousStatus = content.status;
          // Validate status transitions for modules
          if (args.newStatus === "approved") {
            const lessons = await ctx.db
              .query("lessons")
              .withIndex("by_module", (q) => q.eq("moduleId", args.contentId as Id<"modules">))
              .collect();
            validateModuleStatus(args.newStatus as ContentStatus, lessons, content.title);
          }
          await ctx.db.patch(args.contentId as Id<"modules">, {
            status: args.newStatus,
            updatedAt: Date.now(),
          });
        }
        break;
      case "lesson":
        content = await ctx.db.get(args.contentId as Id<"lessons">);
        if (content) {
          previousStatus = content.status;
          // Validate status transitions for lessons
          if (args.newStatus === "approved") {
            const module = await ctx.db.get((content as any).moduleId);
            if (module && !("status" in module)) {
              throw new Error("Parent module not found");
            }
            validateLessonStatus(
              args.newStatus as ContentStatus,
              (module as { status: string })?.status as ContentStatus,
              content.title
            );
          }
          await ctx.db.patch(args.contentId as Id<"lessons">, {
            status: args.newStatus,
            updatedAt: Date.now(),
          });
        }
        break;
      case "quiz":
        content = await ctx.db.get(args.contentId as Id<"quizzes">);
        if (content) {
          previousStatus = content.status;
          await ctx.db.patch(args.contentId as Id<"quizzes">, {
            status: args.newStatus,
            updatedAt: Date.now(),
          });
        }
        break;
      case "assignment":
        content = await ctx.db.get(args.contentId as Id<"assignments">);
        if (content) {
          previousStatus = content.status;
          await ctx.db.patch(args.contentId as Id<"assignments">, {
            status: args.newStatus,
            updatedAt: Date.now(),
          });
        }
        break;
    }

    if (!content) {
      throw new Error("Content not found");
    }

    // Only create audit log if status actually changed
    if (previousStatus !== args.newStatus) {
      // Map status to appropriate audit log action
      const statusToAction: Record<
        string,
        "created" | "submitted_for_review" | "approved" | "rejected" | "changes_requested" | "published" | "unpublished"
      > = {
        approved: "approved",
        changes_requested: "changes_requested",
        published: "published",
        draft: "rejected", // Moving to draft is effectively a rejection
        pending: "submitted_for_review",
      };

      const action = statusToAction[args.newStatus] || "approved"; // Default fallback

      await createAuditLog(
        ctx,
        args.contentType,
        args.contentId,
        action,
        previousStatus,
        args.newStatus,
        `Status changed via Kanban view`
      );

      // Notify creator if status changed to approved or changes_requested
      if (args.newStatus === "approved") {
        await createNotification(
          ctx,
          content.createdBy,
          "content_approved",
          `${args.contentType.charAt(0).toUpperCase() + args.contentType.slice(1)} Approved`,
          `Your ${args.contentType} "${content.title}" has been approved.`,
          args.contentType,
          args.contentId
        );
      } else if (args.newStatus === "changes_requested") {
        await createNotification(
          ctx,
          content.createdBy,
          "content_rejected",
          "Changes Requested",
          `Your ${args.contentType} "${content.title}" needs revisions.`,
          args.contentType,
          args.contentId
        );
      }
    }

    return null;
  },
});

/**
 * Get approval history for content
 */
export const getContentApprovalHistory = adminQuery({
  args: {
    contentType: v.union(
      v.literal("course"),
      v.literal("module"),
      v.literal("lesson"),
      v.literal("quiz"),
      v.literal("assignment")
    ),
    contentId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("auditLogs"),
      action: v.string(),
      performedBy: v.string(),
      performedByName: v.optional(v.string()),
      previousStatus: v.optional(v.string()),
      newStatus: v.optional(v.string()),
      comments: v.optional(v.string()),
      timestamp: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_content", (q) =>
        q.eq("contentType", args.contentType).eq("contentId", args.contentId)
      )
      .order("desc")
      .collect();

    return logs;
  },
});