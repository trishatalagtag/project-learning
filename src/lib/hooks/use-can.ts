import { CONTENT_STATUS, type ContentStatus } from "@/lib/constants/content-status";
import { ROLE, canViewUnpublishedContent } from "@/lib/rbac/permissions";
import { useUserRole } from "@/lib/rbac/use-user-role";

type Action = "view" | "create" | "edit" | "delete" | "approve" | "publish" | "reorder";
type Resource = "lesson" | "module" | "course" | "assignment" | "quiz";

interface ResourceContext {
  status?: ContentStatus;
  teacherId?: string;
  isOwner?: boolean;
}

export function useCan(action: Action, _resource: Resource, context: ResourceContext = {}) {
  const userRole = useUserRole();

  if (!userRole) return false;

  // Admin can do everything
  if (userRole === ROLE.ADMIN) return true;

  // Learners can only view published content
  if (userRole === ROLE.LEARNER) {
    return action === "view" && context.status === CONTENT_STATUS.PUBLISHED;
  }

  // Faculty permissions
  if (userRole === ROLE.FACULTY) {
    switch (action) {
      case "view":
        return canViewUnpublishedContent(userRole);

      case "create":
        return true; // Faculty can create in assigned courses

      case "edit":
      case "delete":
      case "reorder":
        // Cannot edit published content
        return context.status !== CONTENT_STATUS.PUBLISHED;

      case "approve":
      case "publish":
        return false; // Only admin

      default:
        return false;
    }
  }

  return false;
}

// Specific permission hooks for cleaner components
export function useCanEdit(resource: Resource, context: ResourceContext) {
  return useCan("edit", resource, context);
}

export function useCanDelete(resource: Resource, context: ResourceContext) {
  return useCan("delete", resource, context);
}

export function useCanApprove() {
  const userRole = useUserRole();
  return userRole === ROLE.ADMIN;
}

