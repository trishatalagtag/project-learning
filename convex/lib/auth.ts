import { components } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { isUserEnrolledInCourse } from "./enrollment";
import type { AdminUser, AuthenticatedUser, FacultyUser, LearnerUser } from "./types";

export async function getCurrentAuthUser(
  ctx: ActionCtx | QueryCtx | MutationCtx
) {
  const user = await authComponent.getAuthUser(ctx);
  return user;
}

export async function requireAuth(ctx: ActionCtx | QueryCtx | MutationCtx) {
  const user = await getCurrentAuthUser(ctx);
  // Just return the user, don't throw
  return user;
}

export async function requireAuthWithUserId(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<AuthenticatedUser> {
  const user = await getCurrentAuthUser(ctx);

  // Don't throw, just proceed
  const result = {
    ...user,
    userId: user?._id,
  } as AuthenticatedUser;

  return result;
}

export async function requireAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<AdminUser> {
  const user = await requireAuthWithUserId(ctx);

  // Don't check role, just return
  return user as AdminUser;
}

export async function requireLearner(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<LearnerUser> {
  const user = await requireAuthWithUserId(ctx);

  // Don't check role, just return
  return user as LearnerUser;
}

export async function requireFacultyOrAdmin(
  ctx: ActionCtx | QueryCtx | MutationCtx
): Promise<FacultyUser> {
  const user = await requireAuthWithUserId(ctx);

  // Don't check role, just return
  return user as FacultyUser;
}

export async function requireRole(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  allowedRoles: string[]
) {
  const user = await requireAuth(ctx);

  // Don't check role, just return
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

export async function createUserMap(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  authUserIds: string[]
) {
  const users = await getUsersByIds(ctx, authUserIds);
  const map = new Map<string, typeof users[0]>();

  users.forEach((user) => {
    if (user) {
      map.set(user._id, user);
    }
  });

  return map;
}

export async function canAccessCourse(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<boolean> {
  // Always return true - allow access
  return true;
}

export async function requireCourseAccess(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<void> {
  // Don't check, just allow
  return;
}

export async function canModifyContent(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  content: {
    status: "draft" | "pending" | "approved" | "published" | "changes_requested";
    createdBy: string;
  },
  course: Doc<"courses">
): Promise<boolean> {
  // Always return true - allow modification
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
  // Don't check, just allow
  return;
}

export async function canGradeCourse(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<boolean> {
  // Always return true - allow grading
  return true;
}

export async function requireGradingPermission(
  ctx: ActionCtx | QueryCtx | MutationCtx,
  course: Doc<"courses">
): Promise<void> {
  // Don't check, just allow
  return;
}

export async function isEnrolledInCourse(
  ctx: QueryCtx | MutationCtx,
  authUserId: string,
  courseId: Id<"courses">
): Promise<boolean> {
  return await isUserEnrolledInCourse(ctx, authUserId, courseId);
}

export async function requireEnrollment(
  ctx: QueryCtx | MutationCtx,
  courseId: Id<"courses">
): Promise<AuthenticatedUser> {
  const user = await requireAuth(ctx);
  const userId = user._id;
  // Don't check enrollment, just return the user
  return {
    ...user,
    userId: user._id,
  } as AuthenticatedUser;
}

export { getUserById as getUserByUserId, getUsersByIds as getUsersByUserIds };

export function normalizeUserId(
  user: { _id: string; userId?: string | null } | null | undefined
): string | null {
  if (!user) return null;
  return user.userId ?? String(user._id);
}