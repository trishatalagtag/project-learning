export const SUBMISSION_STATUS = {
  SUBMITTED: "submitted",
  GRADED: "graded",
  RETURNED: "returned",
  LATE: "late",
} as const;

export type SubmissionStatus = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS];

export const SUBMISSION_STATUS_CONFIG: Record<
  SubmissionStatus,
  {
    variant: "secondary" | "outline" | "default" | "destructive";
    label: string;
    description: string;
  }
> = {
  [SUBMISSION_STATUS.SUBMITTED]: {
    variant: "outline",
    label: "Submitted",
    description: "Assignment has been submitted and is awaiting grading",
  },
  [SUBMISSION_STATUS.GRADED]: {
    variant: "default",
    label: "Graded",
    description: "Assignment has been graded",
  },
  [SUBMISSION_STATUS.RETURNED]: {
    variant: "secondary",
    label: "Returned",
    description: "Assignment has been returned to student",
  },
  [SUBMISSION_STATUS.LATE]: {
    variant: "destructive",
    label: "Late",
    description: "Assignment was submitted after the deadline",
  },
};

