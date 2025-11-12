import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"

export const CONTENT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  CHANGES_REQUESTED: "changes_requested",
  APPROVED: "approved",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS]

export const STATUS_ICONS = {
  [CONTENT_STATUS.DRAFT]: DocumentTextIcon,
  [CONTENT_STATUS.PENDING]: ClockIcon,
  [CONTENT_STATUS.CHANGES_REQUESTED]: ArrowPathIcon,
  [CONTENT_STATUS.APPROVED]: CheckCircleIcon,
  [CONTENT_STATUS.PUBLISHED]: GlobeAltIcon,
  [CONTENT_STATUS.ARCHIVED]: ArchiveBoxIcon,
} as const

export const STATUS_CONFIG: Record<
  ContentStatus,
  {
    variant: "secondary" | "outline" | "default"
    label: string
    description: string
    icon: typeof DocumentTextIcon
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
  [CONTENT_STATUS.CHANGES_REQUESTED]: {
    variant: "outline",
    label: "Changes Requested",
    description: "Administrator has requested changes before approval",
    icon: ArrowPathIcon,
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
  [CONTENT_STATUS.ARCHIVED]: {
    variant: "secondary",
    label: "Archived",
    description: "Content has been archived and is no longer active",
    icon: ArchiveBoxIcon,
  },
}
