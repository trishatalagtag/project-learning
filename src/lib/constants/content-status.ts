import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const CONTENT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  PUBLISHED: "published",
} as const;

export type ContentStatus = typeof CONTENT_STATUS[keyof typeof CONTENT_STATUS];

export const STATUS_ICONS = {
  [CONTENT_STATUS.DRAFT]: DocumentTextIcon,
  [CONTENT_STATUS.PENDING]: ClockIcon,
  [CONTENT_STATUS.APPROVED]: CheckCircleIcon,
  [CONTENT_STATUS.PUBLISHED]: GlobeAltIcon,
} as const;

export const STATUS_CONFIG: Record<
  ContentStatus,
  {
    variant: "secondary" | "outline" | "default";
    label: string;
    description: string;
    icon: typeof DocumentTextIcon;
  }
> = {
  [CONTENT_STATUS.DRAFT]: {
    variant: "secondary",
    label: "Draft",
    description: "Content is being worked on and is not visible to learners",
    icon: DocumentTextIcon,
  },
  [CONTENT_STATUS.PENDING]: {
    variant: "outline",
    label: "Pending Review",
    description: "Awaiting approval from administrator",
    icon: ClockIcon,
  },
  [CONTENT_STATUS.APPROVED]: {
    variant: "default",
    label: "Approved",
    description: "Approved and ready to publish",
    icon: CheckCircleIcon,
  },
  [CONTENT_STATUS.PUBLISHED]: {
    variant: "default",
    label: "Published",
    description: "Live and visible to learners",
    icon: GlobeAltIcon,
  },
};

