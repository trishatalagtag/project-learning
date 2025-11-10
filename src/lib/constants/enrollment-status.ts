export const ENROLLMENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS];

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
  [ENROLLMENT_STATUS.INACTIVE]: {
    variant: "secondary",
    label: "Inactive",
    description: "Enrollment is inactive",
  },
  [ENROLLMENT_STATUS.PENDING]: {
    variant: "outline",
    label: "Pending",
    description: "Enrollment is pending approval",
  },
  [ENROLLMENT_STATUS.COMPLETED]: {
    variant: "default",
    label: "Completed",
    description: "Student has completed the course",
  },
};

