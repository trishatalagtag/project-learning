import { components } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { Doc as AuthDoc } from "../auth/_generated/dataModel";
import type { AdminUser, AuthenticatedUser, FacultyUser, LearnerUser } from "./types";

export async function getCurrentAuthUser(
  ctx: ActionCtx | QueryCtx | MutationCtx
) {
  console.log("=== getCurrentAuthUser: START ===");
  const user = await authComponent.getAuthUser(ctx);
  console.log("=== getCurrentAuthUser: RESULT ===", JSON.stringify(user, null, 2));
  return user;
}

function normalizeUserId(user: AuthDoc<"user"> | null): string | null {
  console.log("=== normalizeUserId: INPUT ===", user ? { _id: user._id, userId: user.userId } : null);
  if (!user) return null;
  const result = user.userId ?? String(user._id);
  console.log("=== normalizeUserId: OUTPUT ===", result);
  return result;
}

export async function requireAuth(ctx: ActionCtx | QueryCtx | MutationCtx) {
  console.log("=== requireAuth: START ===");
  const user = await getCurrentAuthUser(ctx);
  if (!user) {
    console.log("=== requireAuth: FAILED - No user ===");
    throw new Error("Authentication required");
  }
  console.log("=== requireAuth: SUCCESS ===");
  return user;
}

export async function requireAuthWithUserId(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<AuthenticatedUser> {
  console.log("=== requireAuthWithUserId: START ===");
  
  const user = await getCurrentAuthUser(ctx);
  
  if (!user) {
    console.log("=== requireAuthWithUserId: FAILED - No user ===");
    throw new Error("Authentication required");
  }
  
  const userId = normalizeUserId(user);
  
  if (!userId) {
    console.log("=== requireAuthWithUserId: FAILED - No userId ===");
    throw new Error("User ID not found");
  }
  
  const result = {
    ...user,
    userId,
  } as AuthenticatedUser;
  
  console.log("=== requireAuthWithUserId: SUCCESS ===", { userId: result.userId, role: result.role });
  return result;
}

export async function requireAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<AdminUser> {
  console.log("=== requireAdmin: START ===");
  const user = await requireAuthWithUserId(ctx);
  console.log("=== requireAdmin: Got user with role ===", user.role);
  
  if (user.role !== "ADMIN") {
    console.log("=== requireAdmin: FAILED - Not admin, role is ===", user.role);
    throw new Error("Admin access required");
  }
  
  console.log("=== requireAdmin: SUCCESS ===");
  return user as AdminUser;
}

export async function requireLearner(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<LearnerUser> {
  console.log("=== requireLearner: START ===");
  const user = await requireAuthWithUserId(ctx);
  console.log("=== requireLearner: Got user with role ===", user.role);
  
  if (user.role !== "LEARNER") {
    console.log("=== requireLearner: FAILED - Not learner, role is ===", user.role);
    throw new Error("Learner access required");
  }
  
  console.log("=== requireLearner: SUCCESS ===");
  return user as LearnerUser;
}

export async function requireFacultyOrAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<FacultyUser> {
  console.log("=== requireFacultyOrAdmin: START ===");
  const user = await requireAuthWithUserId(ctx);
  console.log("=== requireFacultyOrAdmin: Got user with role ===", user.role);
  
  if (!["FACULTY", "ADMIN"].includes(user.role ?? "")) {
    console.log("=== requireFacultyOrAdmin: FAILED - Not faculty/admin, role is ===", user.role);
    throw new Error("Faculty or Admin access required");
  }
  
  console.log("=== requireFacultyOrAdmin: SUCCESS ===");
  return user as FacultyUser;
}

export async function requireRole(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  allowedRoles: string[]
) {
  console.log("=== requireRole: START ===", allowedRoles);
  const user = await requireAuth(ctx);
  
  if (!user.role) {
    console.log("=== requireRole: FAILED - No role ===");
    throw new Error("User role not found");
  }
  
  if (!allowedRoles.includes(user.role)) {
    console.log("=== requireRole: FAILED - Role not allowed ===", user.role);
    throw new Error(
      `Unauthorized. Required roles: ${allowedRoles.join(", ")}`
    );
  }
  
  console.log("=== requireRole: SUCCESS ===");
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

export async function getUserByUserId(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  userId: string | null | undefined
) {
  if (!userId) {
    return null;
  }
  return await ctx.runQuery(components.auth.adapter.findOne, {
    model: "user",
    where: [{ field: "userId", operator: "eq", value: userId }],
  });
}

export async function getUsersByUserIds(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  userIds: string[]
) {
  const uniqueUserIds = [...new Set(userIds)];
  return await Promise.all(
    uniqueUserIds.map((userId) => getUserByUserId(ctx, userId))
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

export async function createUserMap(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  userIds: string[]
) {
  const users = await getUsersByUserIds(ctx, userIds);
  const map = new Map<string, typeof users[0]>();
  
  users.forEach((user) => {
    if (user) {
      const userId = normalizeUserId(user);
      if (userId) {
        map.set(userId, user);
      }
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
  
  const userId = normalizeUserId(user);
  if (!userId) return false;

  if (user.role === "ADMIN") return true;

  if (course.teacherId === userId) return true;

  if (course.createdBy === userId && !course.teacherId) return true;

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
    status: "draft" | "pending" | "approved" | "published";
    createdBy: string;
  },
  course: Doc<"courses">
): Promise<boolean> {
  const user = await getCurrentAuthUser(ctx);
  if (!user) return false;
  
  const userId = normalizeUserId(user);
  if (!userId) return false;

  if (user.role === "ADMIN") return true;

  const canAccessThisCourse = await canAccessCourse(ctx, course);
  if (!canAccessThisCourse) return false;

  if (content.status === "published") return false;

  return true;
}

export async function requireContentModifyPermission(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  content: {
    status: "draft" | "pending" | "approved" | "published";
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
  
  const userId = normalizeUserId(user);
  if (!userId) return false;

  if (user.role === "ADMIN") return true;

  if (user.role === "FACULTY" && course.teacherId === userId) return true;

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
  userId: string,
  courseId: Id<"courses">
): Promise<boolean> {
  const enrollment = await ctx.db
    .query("enrollments")
    .withIndex("by_user_and_course", (q) =>
      q.eq("userId", userId).eq("courseId", courseId)
    )
    .filter((q) => q.eq(q.field("status"), "active"))
    .first();

  return !!enrollment;
}

export async function requireEnrollment(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  courseId: Id<"courses">
): Promise<void> {
  const isEnrolled = await isEnrolledInCourse(ctx, userId, courseId);
  if (!isEnrolled) {
    throw new Error("You are not enrolled in this course.");
  }
}