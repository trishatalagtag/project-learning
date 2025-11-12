import { components } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";
import type { AdminUser, AuthenticatedUser, FacultyUser, LearnerUser } from "./types";

export async function getCurrentAuthUser(
  ctx: ActionCtx | QueryCtx | MutationCtx
) {
  const user = await authComponent.getAuthUser(ctx);
  return user;
}

export async function requireAuth(ctx: ActionCtx | QueryCtx | MutationCtx) {
  const user = await getCurrentAuthUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireAuthWithUserId(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<AuthenticatedUser> {
  const user = await getCurrentAuthUser(ctx);
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  const result = {
    ...user,
    userId: user._id,
  } as AuthenticatedUser;
  
  return result;
}

export async function requireAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<AdminUser> {
  const user = await requireAuthWithUserId(ctx);
  
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  
  return user as AdminUser;
}

export async function requireLearner(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<LearnerUser> {
  const user = await requireAuthWithUserId(ctx);
  
  if (user.role !== "LEARNER") {
    throw new Error("Learner access required");
  }
  
  return user as LearnerUser;
}

export async function requireFacultyOrAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<FacultyUser> {
  const user = await requireAuthWithUserId(ctx);
  
  if (!["FACULTY", "ADMIN"].includes(user.role ?? "")) {
    throw new Error("Faculty or Admin access required");
  }
  
  return user as FacultyUser;
}

export async function requireRole(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  allowedRoles: string[]
) {
  const user = await requireAuth(ctx);
  
  if (!user.role) {
    throw new Error("User role not found");
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Unauthorized. Required roles: ${allowedRoles.join(", ")}`
    );
  }
  
  return user;
}

export async function hasRole(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  allowedRoles: string[]
): Promise<boolean> {
  const user = await getCurrentAuthUser(ctx);
  if (!user) return false;
  if (!user.role) return false;
  return allowedRoles.includes(user.role);
}

export async function isAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<boolean> {
  return await hasRole(ctx, ["ADMIN"]);
}

export async function isFacultyOrAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<boolean> {
  return await hasRole(ctx, ["FACULTY", "ADMIN"]);
}

export async function isLearner(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<boolean> {
  return await hasRole(ctx, ["LEARNER"]);
}

// UPDATED: Use _id instead of userId
export async function getUserById(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  authUserId: string | null | undefined
) {
  if (!authUserId) {
    return null;
  }
  return await ctx.runQuery(components.auth.adapter.findOne, {
    model: "user",
    where: [{ field: "_id", operator: "eq", value: authUserId }],
  });
}

// UPDATED: Use _id instead of userId
export async function getUsersByIds(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  authUserIds: string[]
) {
  const uniqueIds = [...new Set(authUserIds)];
  return await Promise.all(
    uniqueIds.map((id) => getUserById(ctx, id))
  );
}

export async function getAllUsers(ctx: ActionCtx | QueryCtx | MutationCtx) {
  return await ctx.runQuery(components.auth.adapter.findMany, {
    model: "user",
    where: [],
    limit: 100,
    offset: 0,
    paginationOpts: {
      cursor: null,
      numItems: 100,
    }
  });
}

export async function getUserByEmail(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  email: string
) {
  return await ctx.runQuery(components.auth.adapter.findOne, {
    model: "user",
    where: [{ field: "email", operator: "eq", value: email }],
  });
}

// UPDATED: Use _id instead of userId
export async function createUserMap(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  authUserIds: string[]
) {
  const users = await getUsersByIds(ctx, authUserIds);
  const map = new Map<string, typeof users[0]>();
  
  users.forEach((user) => {
    if (user) {
      // Use _id as the key
      map.set(user._id, user);
    }
  });
  
  return map;
}

export async function canAccessCourse(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<boolean> {
  const user = await getCurrentAuthUser(ctx);
  if (!user) return false;
  
  // Use _id directly
  const authUserId = user._id;

  if (user.role === "ADMIN") return true;

  if (course.teacherId === authUserId) return true;

  if (course.createdBy === authUserId && !course.teacherId) return true;

  return false;
}

export async function requireCourseAccess(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<void> {
  const hasAccess = await canAccessCourse(ctx, course);
  if (!hasAccess) {
    throw new Error(
      "Access denied. You are not authorized to access this course."
    );
  }
}

export async function canModifyContent(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  content: {
    status: "draft" | "pending" | "approved" | "published" | "changes_requested";
    createdBy: string;
  },
  course: Doc<"courses">
): Promise<boolean> {
  const user = await getCurrentAuthUser(ctx);
  if (!user) return false;
  
  // Use _id directly
  const authUserId = user._id;

  if (user.role === "ADMIN") return true;

  const canAccessThisCourse = await canAccessCourse(ctx, course);
  if (!canAccessThisCourse) return false;

  if (content.status === "published") return false;

  return true;
}

export async function requireContentModifyPermission(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  content: {
    status: "draft" | "pending" | "approved" | "published" | "changes_requested";
    createdBy: string;
  },
  course: Doc<"courses">
): Promise<void> {
  const canModify = await canModifyContent(ctx, content, course);
  if (!canModify) {
    throw new Error(
      "Access denied. You cannot modify this content. " +
        (content.status === "published"
          ? "Published content can only be modified by admins."
          : "You are not authorized to modify this course.")
    );
  }
}

export async function canGradeCourse(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<boolean> {
  const user = await getCurrentAuthUser(ctx);
  if (!user) return false;
  
  // Use _id directly
  const authUserId = user._id;

  if (user.role === "ADMIN") return true;

  if (user.role === "FACULTY" && course.teacherId === authUserId) return true;

  return false;
}

export async function requireGradingPermission(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<void> {
  const canGrade = await canGradeCourse(ctx, course);
  if (!canGrade) {
    throw new Error(
      "Access denied. You are not authorized to grade this course."
    );
  }
}

export async function isEnrolledInCourse(
  ctx: QueryCtx | MutationCtx,
  authUserId: string,
  courseId: Id<"courses">
): Promise<boolean> {
  const enrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_user_and_course", (q) =>
      q.eq("userId", authUserId).eq("courseId", courseId)
    )
    .filter((q) => q.eq(q.field("status"), "active"))
    .first();

  return !!enrollment;
}

export async function requireEnrollment(
  ctx: QueryCtx | MutationCtx,
  authUserId: string,
  courseId: Id<"courses">
): Promise<void> {
  const isEnrolled = await isEnrolledInCourse(ctx, authUserId, courseId);
  if (!isEnrolled) {
    throw new Error("You are not enrolled in this course.");
  }
}

export { getUserById as getUserByUserId, getUsersByIds as getUsersByUserIds };

export function normalizeUserId(
  user: { _id: string; userId?: string | null } | null | undefined
): string | null {
  if (!user) return null;
  return user.userId ?? String(user._id);
}