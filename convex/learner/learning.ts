import { v } from "convex/values";
import { getContentById, getContentTree } from "../lib/content_retrieval";
import {
  getEnrolledCourses as getEnrolledEnrollments,
  isUserEnrolledInCourse,
} from "../lib/enrollment";
import { learnerQuery } from "../lib/functions";

/**
 * List courses the current learner is enrolled in (active)
 */
export const getEnrolledCourses = learnerQuery({
  args: {},
  returns: v.array(
    v.object({
      courseId: v.id("courses"),
      title: v.string(),
      description: v.string(),
      coverImageId: v.optional(v.id("_storage")),
      status: v.string(),
      isEnrollmentOpen: v.boolean(),
      enrolledAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const activeEnrollments = await getEnrolledEnrollments(
      ctx,
      ctx.user.userId,
      "active"
    );

    const courses = await Promise.all(
      activeEnrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;

        return {
          courseId: course._id,
          title: course.title,
          description: course.description,
          coverImageId: course.coverImageId,
          status: course.status,
          isEnrollmentOpen: course.isEnrollmentOpen,
          enrolledAt: enrollment.enrolledAt,
        };
      })
    );

    return courses.filter(Boolean) as any;
  },
});

/**
 * Get course content tree (modules -> lessons -> attachments summary)
 * Requires enrollment
 */
export const getCourseContent = learnerQuery({
  args: { courseId: v.id("courses") },
  returns: v.union(
    v.object({
      courseId: v.id("courses"),
      title: v.string(),
      modules: v.array(
        v.object({
          moduleId: v.id("modules"),
          title: v.string(),
          order: v.number(),
          lessons: v.array(
            v.object({
              lessonId: v.id("lessons"),
              title: v.string(),
              order: v.number(),
              attachments: v.array(
                v.object({
                  type: v.union(
                    v.literal("video"),
                    v.literal("resource"),
                    v.literal("guide"),
                    v.literal("quiz"),
                    v.literal("assignment")
                  ),
                  title: v.optional(v.string()),
                  id: v.string(), // attachmentId or linked quiz/assignment id as string
                  order: v.number(),
                })
              ),
            })
          ),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const enrolled = await isUserEnrolledInCourse(
      ctx,
      ctx.user.userId,
      args.courseId
    );

    if (!enrolled) return null;

    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const modules = await getContentTree(ctx, args.courseId, ["published"], true);

    const normalizedModules = modules.map((module) => ({
      moduleId: module._id,
      title: module.title,
      order: module.order,
      lessons: module.lessons.map((lesson: any) => ({
        lessonId: lesson._id,
        title: lesson.title,
        order: lesson.order,
        attachments: (lesson.attachments ?? [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((att: any) => {
            if (att.type === "quiz") {
              return {
                type: "quiz" as const,
                title: undefined,
                id: att.quizId as unknown as string,
                order: att.order,
              };
            }

            if (att.type === "assignment") {
              return {
                type: "assignment" as const,
                title: undefined,
                id: att.assignmentId as unknown as string,
                order: att.order,
              };
            }

            return {
              type: att.type,
              title: att.title,
              id: att._id as unknown as string,
              order: att.order,
            };
          }),
      })),
    }));

    return {
      courseId: course._id,
      title: course.title,
      modules: normalizedModules,
    };
  },
});

/**
 * Get full lesson content + all attachments (videos/resources/guides links)
 * Requires enrollment
 */
export const getLessonContent = learnerQuery({
  args: { lessonId: v.id("lessons") },
  returns: v.union(
    v.object({
      lessonId: v.id("lessons"),
      moduleId: v.id("modules"),
      courseId: v.id("courses"),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      attachments: v.array(
        v.union(
          v.object({
            type: v.literal("video"),
            attachmentId: v.id("lessonAttachments"),
            title: v.string(),
            description: v.optional(v.string()),
            fileId: v.id("_storage"),
            order: v.number(),
          }),
          v.object({
            type: v.literal("resource"),
            attachmentId: v.id("lessonAttachments"),
            title: v.string(),
            description: v.optional(v.string()),
            fileId: v.id("_storage"),
            fileType: v.string(),
            fileSize: v.number(),
            order: v.number(),
          }),
          v.object({
            type: v.literal("guide"),
            attachmentId: v.id("lessonAttachments"),
            title: v.string(),
            description: v.optional(v.string()),
            order: v.number(),
          }),
          v.object({
            type: v.literal("quiz"),
            attachmentId: v.id("lessonAttachments"),
            quizId: v.id("quizzes"),
            order: v.number(),
          }),
          v.object({
            type: v.literal("assignment"),
            attachmentId: v.id("lessonAttachments"),
            assignmentId: v.id("assignments"),
            order: v.number(),
          })
        )
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await getContentById(ctx, "lessons", args.lessonId, ["published"]);
    if (!lesson) return null;

    const module = await getContentById(ctx, "modules", lesson.moduleId, ["published"]);
    if (!module) return null;
    const enrolled = await isUserEnrolledInCourse(
      ctx,
      ctx.user.userId,
      module.courseId
    );
    if (!enrolled) return null;

    const attachments = await ctx.db
      .query("lessonAttachments")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    const normalized = attachments
      .sort((a, b) => a.order - b.order)
      .map((att) => {
        if (att.type === "video") {
          return {
            type: "video" as const,
            attachmentId: att._id,
            title: att.title,
            description: att.description,
            fileId: att.fileId,
            order: att.order,
          };
        }
        if (att.type === "resource") {
          return {
            type: "resource" as const,
            attachmentId: att._id,
            title: att.title,
            description: att.description,
            fileId: att.fileId,
            fileType: att.fileType,
            fileSize: att.fileSize,
            order: att.order,
          };
        }
        if (att.type === "guide") {
          return {
            type: "guide" as const,
            attachmentId: att._id,
            title: att.title,
            description: att.description,
            order: att.order,
          };
        }
        if (att.type === "quiz") {
          return {
            type: "quiz" as const,
            attachmentId: att._id,
            quizId: att.quizId,
            order: att.order,
          };
        }
        return {
          type: "assignment" as const,
          attachmentId: att._id,
          assignmentId: att.assignmentId,
          order: att.order,
        };
      });

    return {
      lessonId: lesson._id,
      moduleId: lesson.moduleId,
      courseId: module.courseId,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      attachments: normalized as any,
    };
  },
});

/**
 * Get guide with steps (requires enrollment)
 */
export const getGuideWithSteps = learnerQuery({
  args: { guideId: v.id("lessonAttachments") },
  returns: v.union(
    v.object({
      guideId: v.id("lessonAttachments"),
      lessonId: v.id("lessons"),
      title: v.string(),
      description: v.optional(v.string()),
      introduction: v.optional(v.string()),
      conclusion: v.optional(v.string()),
      steps: v.array(
        v.object({
          stepId: v.id("guideSteps"),
          stepNumber: v.number(),
          title: v.string(),
          content: v.string(),
          imageId: v.optional(v.id("_storage")),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide || guide.type !== "guide") return null;

    const lesson = await ctx.db.get(guide.lessonId);
    if (!lesson) return null;

    const module = await ctx.db.get(lesson.moduleId);
    if (!module) return null;

    // Ensure enrolled
    const enrolled = await isUserEnrolledInCourse(
      ctx,
      ctx.user.userId,
      module.courseId
    );
    if (!enrolled) return null;

    const steps = await ctx.db
      .query("guideSteps")
      .withIndex("by_guide_and_step", (q) => q.eq("guideId", guide._id))
      .collect();

    const ordered = steps.sort((a, b) => a.stepNumber - b.stepNumber).map((s) => ({
      stepId: s._id,
      stepNumber: s.stepNumber,
      title: s.title,
      content: s.content,
      imageId: s.imageId,
    }));

    return {
      guideId: guide._id,
      lessonId: guide.lessonId,
      title: guide.title,
      description: guide.description,
      introduction: guide.introduction,
      conclusion: guide.conclusion,
      steps: ordered,
    };
  },
});