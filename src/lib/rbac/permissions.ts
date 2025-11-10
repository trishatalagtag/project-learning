export const ROLE = {
  ADMIN: "ADMIN",
  FACULTY: "FACULTY",
  LEARNER: "LEARNER",
} as const;

export type UserRole = (typeof ROLE)[keyof typeof ROLE];

/**
 * Can the user view unpublished content?
 * Backend: Admin/Faculty queries don't filter by status
 */
export function canViewUnpublishedContent(role: UserRole): boolean {
  return role === ROLE.ADMIN || role === ROLE.FACULTY;
}

