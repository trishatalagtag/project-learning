import { v } from "convex/values";

// ==================== PAGINATION ====================

export const paginationArgs = {
  limit: v.optional(v.number()), // default: 50, max: 100
  offset: v.optional(v.number()), // default: 0
};

export const sortArgs = {
  sortBy: v.optional(v.string()), // default: "createdAt"
  sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))), // default: "desc"
};

export const searchArgs = {
  search: v.optional(v.string()), // search query
};

export const listArgs = {
  ...paginationArgs,
  ...sortArgs,
  ...searchArgs,
};

/**
 * Get pagination defaults
 */
export function getPaginationDefaults(args: {
  limit?: number;
  offset?: number;
}) {
  const limit = Math.min(args.limit ?? 50, 100);
  const offset = args.offset ?? 0;
  return { limit, offset };
}

/**
 * Get sort defaults
 */
export function getSortDefaults(args: {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const sortBy = args.sortBy ?? "createdAt";
  const sortOrder = args.sortOrder ?? "desc";
  return { sortBy, sortOrder };
}

// ==================== FILTERS ====================

export const courseStatusFilter = v.optional(
  v.union(
    v.literal("draft"),
    v.literal("pending"),
    v.literal("approved"),
    v.literal("published"),
    v.literal("archived")
  )
);

export const contentStatusFilter = v.optional(
  v.union(
    v.literal("draft"),
    v.literal("pending"),
    v.literal("approved"),
    v.literal("published")
  )
);

export const enrollmentStatusFilter = v.optional(
  v.union(
    v.literal("active"),
    v.literal("completed"),
    v.literal("dropped")
  )
);

export const submissionStatusFilter = v.optional(
  v.union(
    v.literal("draft"),
    v.literal("submitted"),
    v.literal("graded")
  )
);

// ==================== GRADING ====================

export const gradingConfigValidator = v.object({
  passingScore: v.number(),
  gradingMethod: v.union(
    v.literal("numerical"),
    v.literal("competency"),
    v.literal("weighted")
  ),
  components: v.optional(
    v.array(
      v.object({
        name: v.string(),
        weight: v.number(),
      })
    )
  ),
});

// ==================== FILE VALIDATION ====================

export const fileUploadArgs = {
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
};

/**
 * Validate file size (max 50MB)
 */
export function validateFileSize(size: number): boolean {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  return size <= MAX_FILE_SIZE;
}

/**
 * Validate file type
 */
export function validateFileType(
  type: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(type);
}

/**
 * Common allowed file types
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const ALLOWED_RESOURCE_TYPES = [
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_IMAGE_TYPES,
];

// ==================== LIST PROCESSING HELPERS ====================

/**
 * Apply search filter to items
 * Searches in title, description, name fields
 */
export function applySearchFilter<
  T extends { title?: string; description?: string; name?: string }
>(items: T[], searchQuery?: string): T[] {
  if (!searchQuery) return items;

  const searchLower = searchQuery.toLowerCase();
  return items.filter((item) => {
    const searchableText = [item.title, item.description, item.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchLower);
  });
}

/**
 * Apply sorting to items
 */
export function applySorting<T>(
  items: T[],
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): T[] {
  return [...items].sort((a, b) => {
    const aVal = (a as any)[sortBy];
    const bVal = (b as any)[sortBy];

    // Handle null/undefined
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    // Compare based on type
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    // String comparison
    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortOrder === "asc" ? comparison : -comparison;
  });
}

/**
 * Apply pagination to items
 */
export function applyPagination<T>(
  items: T[],
  limit: number,
  offset: number
): {
  items: T[];
  total: number;
  hasMore: boolean;
} {
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    total: items.length,
    hasMore: offset + limit < items.length,
  };
}

/**
 * Complete list processing pipeline
 * Applies search -> sort -> paginate in one call
 */
export function processListQuery<
  T extends { title?: string; description?: string; name?: string }
>(
  items: T[],
  args: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
  }
): {
  items: T[];
  total: number;
  hasMore: boolean;
} {
  const { limit, offset } = getPaginationDefaults(args);
  const { sortBy, sortOrder } = getSortDefaults(args);

  // Apply filters
  let filtered = applySearchFilter(items, args.search);

  // Apply sorting
  filtered = applySorting(filtered, sortBy, sortOrder);

  // Apply pagination
  return applyPagination(filtered, limit, offset);
}

// ==================== DATE HELPERS ====================

/**
 * Check if a date is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > Date.now();
}

/**
 * Check if current time is within a date range
 */
export function isWithinRange(
  startTime?: number,
  endTime?: number
): boolean {
  const now = Date.now();
  if (startTime && now < startTime) return false;
  if (endTime && now > endTime) return false;
  return true;
}

/**
 * Check if a submission is late
 */
export function isSubmissionLate(
  submittedAt: number,
  dueDate?: number
): boolean {
  if (!dueDate) return false;
  return submittedAt > dueDate;
}

// ==================== GRADING VALIDATION ====================

/**
 * Validate grading configuration
 * Throws error if invalid
 */
export function validateGradingConfig(config: {
  passingScore: number;
  gradingMethod: "numerical" | "competency" | "weighted";
  components?: Array<{ name: string; weight: number }>;
}): void {
  // Validate passing score
  if (config.passingScore < 0 || config.passingScore > 100) {
    throw new Error("Passing score must be between 0 and 100");
  }

  // Validate weighted components
  if (config.gradingMethod === "weighted") {
    if (!config.components || config.components.length === 0) {
      throw new Error("Weighted grading requires at least one component");
    }

    const total = config.components.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error(`Component weights must sum to 100 (current: ${total.toFixed(2)})`);
    }

    // Validate each component
    for (const comp of config.components) {
      if (!comp.name || comp.name.trim().length === 0) {
        throw new Error("All components must have a name");
      }
      if (comp.weight <= 0) {
        throw new Error("Component weight must be positive");
      }
      if (comp.weight > 100) {
        throw new Error("Component weight cannot exceed 100");
      }
    }
  }

  // Validate numerical grading
  if (config.gradingMethod === "numerical") {
    if (config.components && config.components.length > 0) {
      throw new Error("Numerical grading should not have components");
    }
  }
}