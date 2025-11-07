import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { createUserMap } from "../lib/auth";
import { adminMutation, adminQuery } from "../lib/functions";

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

    // For lessons, need to check module's courseId
    let filteredLessons = lessons;
    if (args.courseId) {
      const moduleIds = filteredModules.map((m) => m._id);
      filteredLessons = [];
      for (const lesson of lessons) {
        const module = await ctx.db.get(lesson.moduleId);
        if (module && module.courseId === args.courseId) {
          filteredLessons.push(lesson);
        }
      }
    }

    // Enrich modules
    const enrichedModules = await Promise.all(
      filteredModules.map(async (module) => {
        const course = await ctx.db.get(module.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), module.createdBy))
          .first();

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
      })
    );

    // Enrich lessons
    const enrichedLessons = await Promise.all(
      filteredLessons.map(async (lesson) => {
        const module = await ctx.db.get(lesson.moduleId);
        const course = module ? await ctx.db.get(module.courseId) : null;
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), lesson.createdBy))
          .first();

        return {
          _id: lesson._id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          moduleName: module?.title ?? "Unknown",
          courseId: module?.courseId ?? ("" as any),
          courseName: course?.title ?? "Unknown",
          createdBy: lesson.createdBy,
          createdByName: creator?.name ?? "Unknown",
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        };
      })
    );

    // Enrich quizzes
    const enrichedQuizzes = await Promise.all(
      filteredQuizzes.map(async (quiz) => {
        const course = await ctx.db.get(quiz.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), quiz.createdBy))
          .first();

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
      })
    );

    // Enrich assignments
    const enrichedAssignments = await Promise.all(
      filteredAssignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), assignment.createdBy))
          .first();

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
      })
    );

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

    // For lessons, need to check module's courseId
    let filteredLessons = lessons;
    if (args.courseId) {
      const moduleIds = filteredModules.map((m) => m._id);
      filteredLessons = [];
      for (const lesson of lessons) {
        const module = await ctx.db.get(lesson.moduleId);
        if (module && module.courseId === args.courseId) {
          filteredLessons.push(lesson);
        }
      }
    }

    // Enrich modules
    const enrichedModules = await Promise.all(
      filteredModules.map(async (module) => {
        const course = await ctx.db.get(module.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), module.createdBy))
          .first();

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
      })
    );

    // Enrich lessons
    const enrichedLessons = await Promise.all(
      filteredLessons.map(async (lesson) => {
        const module = await ctx.db.get(lesson.moduleId);
        const course = module ? await ctx.db.get(module.courseId) : null;
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), lesson.createdBy))
          .first();

        return {
          _id: lesson._id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          moduleName: module?.title ?? "Unknown",
          courseId: module?.courseId ?? ("" as any),
          courseName: course?.title ?? "Unknown",
          createdBy: lesson.createdBy,
          createdByName: creator?.name ?? "Unknown",
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
        };
      })
    );

    // Enrich quizzes
    const enrichedQuizzes = await Promise.all(
      filteredQuizzes.map(async (quiz) => {
        const course = await ctx.db.get(quiz.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), quiz.createdBy))
          .first();

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
      })
    );

    // Enrich assignments
    const enrichedAssignments = await Promise.all(
      filteredAssignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), assignment.createdBy))
          .first();

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
      })
    );

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

    // For lessons, need to check module's courseId
    let filteredLessons = lessons;
    if (args.courseId) {
      const moduleIds = filteredModules.map((m) => m._id);
      filteredLessons = [];
      for (const lesson of lessons) {
        const module = await ctx.db.get(lesson.moduleId);
        if (module && module.courseId === args.courseId) {
          filteredLessons.push(lesson);
        }
      }
    }

    // Enrich modules
    const enrichedModules = await Promise.all(
      filteredModules.map(async (module) => {
        const course = await ctx.db.get(module.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), module.createdBy))
          .first();

        return {
          _id: module._id,
          title: module.title,
          courseId: module.courseId,
          courseName: course?.title ?? "Unknown",
          createdBy: module.createdBy,
          createdByName: creator?.name ?? "Unknown",
          createdAt: module.createdAt,
        };
      })
    );

    // Enrich lessons
    const enrichedLessons = await Promise.all(
      filteredLessons.map(async (lesson) => {
        const module = await ctx.db.get(lesson.moduleId);
        const course = module ? await ctx.db.get(module.courseId) : null;
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), lesson.createdBy))
          .first();

        return {
          _id: lesson._id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          moduleName: module?.title ?? "Unknown",
          courseId: module?.courseId ?? ("" as any),
          courseName: course?.title ?? "Unknown",
          createdBy: lesson.createdBy,
          createdByName: creator?.name ?? "Unknown",
          createdAt: lesson.createdAt,
        };
      })
    );

    // Enrich quizzes
    const enrichedQuizzes = await Promise.all(
      filteredQuizzes.map(async (quiz) => {
        const course = await ctx.db.get(quiz.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), quiz.createdBy))
          .first();

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
      })
    );

    // Enrich assignments
    const enrichedAssignments = await Promise.all(
      filteredAssignments.map(async (assignment) => {
        const course = await ctx.db.get(assignment.courseId);
        const creator = await ctx.db
          .query("users" as any)
          .filter((q: any) => q.eq(q.field("id"), assignment.createdBy))
          .first();

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
      })
    );

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

    await ctx.db.patch(args.moduleId, {
      status: "approved",
      updatedAt: Date.now(),
    });

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

    await ctx.db.patch(args.lessonId, {
      status: "approved",
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Approve quiz
 * Admin only
 */
export const approveQuiz = adminMutation({
  args: { quizId: v.id("quizzes") },
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

    return null;
  },
});

/**
 * Approve assignment
 * Admin only
 */
export const approveAssignment = adminMutation({
  args: { assignmentId: v.id("assignments") },
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

    return null;
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
    contentId: v.string(), // Generic ID, cast to specific type
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    let content: any;
    let table: string;

    // Get content based on type
    switch (args.contentType) {
      case "module":
        content = await ctx.db.get(args.contentId as any);
        table = "modules";
        break;
      case "lesson":
        content = await ctx.db.get(args.contentId as any);
        table = "lessons";
        break;
      case "quiz":
        content = await ctx.db.get(args.contentId as any);
        table = "quizzes";
        break;
      case "assignment":
        content = await ctx.db.get(args.contentId as any);
        table = "assignments";
        break;
    }

    if (!content) {
      throw new Error(`${args.contentType} not found`);
    }

    if (content.status !== "pending") {
      throw new Error(`Only pending ${args.contentType}s can be rejected`);
    }

    // Set back to draft
    await ctx.db.patch(args.contentId as any, {
      status: "draft",
      updatedAt: Date.now(),
    });

    // TODO: In production, notify creator with rejection reason
    // Could store rejection history in a separate table

    return null;
  },
});