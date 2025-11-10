import { v } from "convex/values";
import { action } from "../_generated/server";
import { adminQuery } from "../lib/functions";

/**
 * Get system-wide statistics
 * Admin only
 */
export const getSystemStats = adminQuery({
  args: {},
  returns: v.object({
    totalUsers: v.number(),
    totalLearners: v.number(),
    totalFaculty: v.number(),
    totalAdmins: v.number(),
    totalCourses: v.number(),
    publishedCourses: v.number(),
    pendingCourses: v.number(),
    totalEnrollments: v.number(),
    activeEnrollments: v.number(),
    completedEnrollments: v.number(),
    totalModules: v.number(),
    totalLessons: v.number(),
    totalQuizzes: v.number(),
    totalAssignments: v.number(),
  }),
  handler: async (ctx) => {

    console.log("getSystemStats", ctx.user);
    // Get all users
    const allUsers = await ctx.db.query("users" as any).collect();
    const learners = allUsers.filter((u: any) => u.role === "LEARNER");
    const faculty = allUsers.filter((u: any) => u.role === "FACULTY");
    const admins = allUsers.filter((u: any) => u.role === "ADMIN");

    // Get courses
    const allCourses = await ctx.db.query("courses").collect();
    const publishedCourses = allCourses.filter((c) => c.status === "published");
    const pendingCourses = allCourses.filter((c) => c.status === "pending");

    // Get enrollments (use collect().length for better performance)
    const [totalEnrollments, activeEnrollments, completedEnrollments] = await Promise.all([
      ctx.db.query("enrollments").collect().then((items) => items.length),
      ctx.db.query("enrollments").withIndex("by_status", (q) => q.eq("status", "active")).collect().then((items) => items.length),
      ctx.db.query("enrollments").withIndex("by_status", (q) => q.eq("status", "completed")).collect().then((items) => items.length),
    ]);

    // Get content counts
    const modules = await ctx.db.query("modules").collect();
    const lessons = await ctx.db.query("lessons").collect();
    const quizzes = await ctx.db.query("quizzes").collect();
    const assignments = await ctx.db.query("assignments").collect();

    return {
      totalUsers: allUsers.length,
      totalLearners: learners.length,
      totalFaculty: faculty.length,
      totalAdmins: admins.length,
      totalCourses: allCourses.length,
      publishedCourses: publishedCourses.length,
      pendingCourses: pendingCourses.length,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalModules: modules.length,
      totalLessons: lessons.length,
      totalQuizzes: quizzes.length,
      totalAssignments: assignments.length,
    };
  },
});

/**
 * Get enrollment trends over time
 * Admin only
 */
export const getEnrollmentTrends = adminQuery({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      date: v.string(), // YYYY-MM-DD
      enrollments: v.number(),
      completions: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const endDate = args.endDate ?? Date.now();
    const startDate = args.startDate ?? endDate - 30 * 24 * 60 * 60 * 1000; // 30 days ago

    // Get all enrollments in date range
    const enrollments = await ctx.db
      .query("enrollments")
      .filter((q) =>
        q.and(
          q.gte(q.field("enrolledAt"), startDate),
          q.lte(q.field("enrolledAt"), endDate)
        )
      )
      .collect();

    // Group by date
    const dailyStats = new Map<string, { enrollments: number; completions: number }>();

    enrollments.forEach((enrollment) => {
      const date = new Date(enrollment.enrolledAt).toISOString().split("T")[0];
      
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { enrollments: 0, completions: 0 });
      }
      
      const stats = dailyStats.get(date)!;
      stats.enrollments++;
      
      if (
        enrollment.completedAt &&
        enrollment.completedAt >= startDate &&
        enrollment.completedAt <= endDate
      ) {
        stats.completions++;
      }
    });

    // Convert to array and sort
    return Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        enrollments: stats.enrollments,
        completions: stats.completions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

/**
 * Get course completion rates
 * Admin only
 */
export const getCourseCompletionRates = adminQuery({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      courseId: v.id("courses"),
      courseName: v.string(),
      totalEnrollments: v.number(),
      activeEnrollments: v.number(),
      completedEnrollments: v.number(),
      completionRate: v.number(), // percentage
      averageCompletionTime: v.optional(v.number()), // days
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Get all courses
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("status"), "published"))
      .take(limit);

    const stats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(
          (e) => e.status === "active"
        ).length;
        const completedEnrollments = enrollments.filter(
          (e) => e.status === "completed"
        ).length;

        const completionRate =
          totalEnrollments > 0
            ? (completedEnrollments / totalEnrollments) * 100
            : 0;

        // Calculate average completion time
        const completedWithTime = enrollments.filter(
          (e) => e.status === "completed" && e.completedAt
        );
        
        let averageCompletionTime: number | undefined;
        if (completedWithTime.length > 0) {
          const totalDays = completedWithTime.reduce((sum, e) => {
            const days =
              (e.completedAt! - e.enrolledAt) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0);
          averageCompletionTime = totalDays / completedWithTime.length;
        }

        return {
          courseId: course._id,
          courseName: course.title,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          completionRate: Math.round(completionRate * 100) / 100,
          averageCompletionTime: averageCompletionTime
            ? Math.round(averageCompletionTime * 10) / 10
            : undefined,
        };
      })
    );

    // Sort by completion rate descending
    return stats.sort((a, b) => b.completionRate - a.completionRate);
  },
});

/**
 * Export analytics report (CSV or PDF)
 * Admin only - action for generating files
 */
export const exportAnalyticsReport = action({
  args: {
    reportType: v.union(
      v.literal("enrollments"),
      v.literal("completions"),
      v.literal("user_activity")
    ),
    format: v.union(v.literal("csv"), v.literal("json")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.string(), // Returns download URL or data
  handler: async (ctx, args) => {
    // Note: In production, you would:
    // 1. Generate the report data
    // 2. Format it as CSV/JSON
    // 3. Upload to storage or return directly
    // 4. Return download URL

    // For now, return a placeholder
    // This would be implemented based on your specific export requirements
    
    return "Report generation not yet implemented. Use getSystemStats, getEnrollmentTrends, and getCourseCompletionRates for now.";
  },
});