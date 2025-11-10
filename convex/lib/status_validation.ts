import type { Doc } from "../_generated/dataModel";

export type ContentStatus = "draft" | "pending" | "approved" | "published" | "archived";

/**
 * Status hierarchy from lowest to highest
 * Lower index = lower status level
 */
const STATUS_HIERARCHY: ContentStatus[] = [
  "draft",
  "pending",
  "approved",
  "published",
  "archived",
];

/**
 * Get the numeric level of a status (higher = more advanced)
 */
export function getStatusLevel(status: ContentStatus): number {
  return STATUS_HIERARCHY.indexOf(status);
}

/**
 * Compare two statuses
 * @returns positive if status1 > status2, negative if status1 < status2, 0 if equal
 */
export function compareStatuses(status1: ContentStatus, status2: ContentStatus): number {
  return getStatusLevel(status1) - getStatusLevel(status2);
}

/**
 * Check if status1 is higher than status2
 */
export function isStatusHigherThan(status1: ContentStatus, status2: ContentStatus): boolean {
  return compareStatuses(status1, status2) > 0;
}

/**
 * Check if status1 is lower than or equal to status2
 */
export function isStatusAllowed(
  childStatus: ContentStatus,
  parentStatus: ContentStatus
): boolean {
  return compareStatuses(childStatus, parentStatus) <= 0;
}

/**
 * Validate if a lesson can be set to a target status given its parent module status
 * @throws Error if validation fails
 */
export function validateLessonStatus(
  lessonStatus: ContentStatus,
  moduleStatus: ContentStatus,
  lessonTitle: string
): void {
  if (isStatusHigherThan(lessonStatus, moduleStatus)) {
    const moduleLevel = STATUS_HIERARCHY[getStatusLevel(moduleStatus)];
    const lessonLevel = STATUS_HIERARCHY[getStatusLevel(lessonStatus)];

    throw new Error(
      `Cannot set lesson "${lessonTitle}" to "${lessonLevel}". ` +
      `Parent module is currently "${moduleLevel}". ` +
      `Please update the module first.`
    );
  }
}

/**
 * Validate if a module can be set to a target status given its child lessons
 * @throws Error if validation fails with list of blocking lessons
 */
export function validateModuleStatus(
  moduleStatus: ContentStatus,
  lessons: Doc<"lessons">[],
  moduleTitle: string
): void {
  const blockingLessons = lessons.filter((lesson) =>
    isStatusHigherThan(lesson.status as ContentStatus, moduleStatus)
  );

  if (blockingLessons.length > 0) {
    const lessonNames = blockingLessons.map((l) => `"${l.title}"`).join(", ");
    const moduleLevel = STATUS_HIERARCHY[getStatusLevel(moduleStatus)];

    throw new Error(
      `Cannot set module "${moduleTitle}" to "${moduleLevel}". ` +
      `${blockingLessons.length} lesson(s) have higher status: ${lessonNames}. ` +
      `Update lessons first.`
    );
  }
}

/**
 * Get allowed statuses for a lesson given parent module status
 */
export function getAllowedLessonStatuses(moduleStatus: ContentStatus): ContentStatus[] {
  const moduleLevel = getStatusLevel(moduleStatus);
  return STATUS_HIERARCHY.slice(0, moduleLevel + 1);
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: ContentStatus): string {
  const names: Record<ContentStatus, string> = {
    draft: "Draft",
    pending: "Ready for Review",
    approved: "Approved",
    published: "Published",
    archived: "Archived",
  };
  return names[status];
}

