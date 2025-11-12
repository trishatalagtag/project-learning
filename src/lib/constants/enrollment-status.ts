import type { Doc } from "@/convex/_generated/dataModel";

export const ENROLLMENT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DROPPED: "dropped",
} as const;

// Infer from backend schema
export type EnrollmentStatus = Doc<"enrollments">["status"];

export const ENROLLMENT_STATUS_CONFIG: Record<
  EnrollmentStatus,
  {
    variant: "secondary" | "outline" | "default" | "destructive";
    label: string;
    description: string;
  }
> = {
  [ENROLLMENT_STATUS.ACTIVE]: {
    variant: "default",
    label: "Active",
    description: "Student is actively enrolled in the course",
  },
  [ENROLLMENT_STATUS.COMPLETED]: {
    variant: "default",
    label: "Completed",
    description: "Student has completed the course",
  },
  [ENROLLMENT_STATUS.DROPPED]: {
    variant: "secondary",
    label: "Dropped",
    description: "Student has dropped the course",
  },
};

