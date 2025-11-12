import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Check if a course is available for enrollment.
 */
export async function isCourseAvailableForEnrollment(
  ctx: QueryCtx,
  courseId: Id<"courses">
): Promise<{ available: boolean; reason?: string }> {
  const course = await ctx.db.get(courseId);
  
  if (!course) {
    return { available: false, reason: "Course not found" };
  }
  
  if (course.status !== "published") {
    return { available: false, reason: "Course is not published" };
  }
  
  if (!course.isEnrollmentOpen) {
    return { available: false, reason: "Enrollment is closed" };
  }
  
  return { available: true };
}

/**
 * Check if user is enrolled in a course.
 */
export async function isUserEnrolledInCourse(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<boolean> {
  const enrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_user_and_course", (q) => 
      q.eq("userId", userId).eq("courseId", courseId)
    )
    .unique();
  
  return enrollment?.status === "active";
}

/**
 * Get enrollment record for user in course.
 */
export async function getEnrollment(
  ctx: QueryCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<Doc<"enrollments"> | null> {
  return await ctx.db
    .query("enrollments")
    .withIndex("by_user_and_course", (q) => 
      q.eq("userId", userId).eq("courseId", courseId)
    )
    .unique();
}

/**
 * Enroll user in a course.
 */
export async function enrollUserInCourse(
  ctx: MutationCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<void> {
  // Check existing enrollment
  const existing = await getEnrollment(ctx, userId, courseId);
  
  if (existing) {
    if (existing.status === "active") {
      throw new Error("Already enrolled in this course");
    }
    // Reactivate if previously dropped
    await ctx.db.patch(existing._id, {
      status: "active",
      enrolledAt: Date.now(),
    });
    return;
  }
  
  // Check availability
  const { available, reason } = await isCourseAvailableForEnrollment(ctx, courseId);
  if (!available) {
    throw new Error(reason || "Course not available for enrollment");
  }
  
  // Create enrollment
  await ctx.db.insert("enrollments", {
    userId,
    courseId,
    status: "active",
    enrolledAt: Date.now(),
  });
}

/**
 * Enroll user with enrollment code.
 */
export async function enrollWithCode(
  ctx: MutationCtx,
  userId: string,
  enrollmentCode: string
): Promise<Id<"courses">> {
  const course = await ctx.db
    .query("courses")
    .withIndex("by_enrollment_code", (q) => q.eq("enrollmentCode", enrollmentCode))
    .unique();
  
  if (!course) {
    throw new Error("Invalid enrollment code");
  }
  
  await enrollUserInCourse(ctx, userId, course._id);
  
  return course._id;
}

/**
 * Unenroll user from course.
 */
export async function unenrollFromCourse(
  ctx: MutationCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<void> {
  const enrollment = await getEnrollment(ctx, userId, courseId);
  
  if (!enrollment || enrollment.status !== "active") {
    throw new Error("Not enrolled in this course");
  }
  
  await ctx.db.patch(enrollment._id, {
    status: "dropped",
  });
}

/**
 * Get all courses a user is enrolled in.
 */
export async function getEnrolledCourses(
  ctx: QueryCtx,
  userId: string,
  status: "active" | "completed" | "dropped" = "active"
): Promise<Doc<"enrollments">[]> {
  return await ctx.db
    .query("enrollments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("status"), status))
    .collect();
}

/**
 * Get enrollment count for a course.
 */
export async function getEnrollmentCount(
  ctx: QueryCtx,
  courseId: Id<"courses">,
  status: "active" | "completed" | "dropped" = "active"
): Promise<number> {
  const enrollments = await ctx.db
    .query("enrollments")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .filter((q) => q.eq(q.field("status"), status))
    .collect();
  
  return enrollments.length;
}
