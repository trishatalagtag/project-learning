import type { Doc } from "@/convex/_generated/dataModel";

export const SUBMISSION_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  GRADED: "graded",
} as const;

// Infer from backend schema
export type SubmissionStatus = Doc<"assignmentSubmissions">["status"];

export const SUBMISSION_STATUS_CONFIG: Record<
  SubmissionStatus,
  {
    variant: "secondary" | "outline" | "default" | "destructive";
    label: string;
    description: string;
  }
> = {
  [SUBMISSION_STATUS.DRAFT]: {
    variant: "secondary",
    label: "Draft",
    description: "Assignment submission is in draft and not yet submitted",
  },
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
};

