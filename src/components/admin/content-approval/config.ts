import {
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"
import type { ContentType, StatusType } from "./types"

export const TYPE_CONFIG: Record<
  ContentType,
  {
    icon: typeof AcademicCapIcon
    label: string
    pluralLabel: string
    color: "primary" | "secondary" | "info" | "success" | "warning"
  }
> = {
  course: {
    icon: AcademicCapIcon,
    label: "Course",
    pluralLabel: "Courses",
    color: "primary",
  },
  module: {
    icon: BookOpenIcon,
    label: "Module",
    pluralLabel: "Modules",
    color: "secondary",
  },
  lesson: {
    icon: DocumentTextIcon,
    label: "Lesson",
    pluralLabel: "Lessons",
    color: "info",
  },
  quiz: {
    icon: ClipboardDocumentCheckIcon,
    label: "Quiz",
    pluralLabel: "Quizzes",
    color: "success",
  },
  assignment: {
    icon: PencilSquareIcon,
    label: "Assignment",
    pluralLabel: "Assignments",
    color: "warning",
  },
}

export const STATUS_CONFIG: Record<
  StatusType,
  {
    label: string
    color: "warning" | "success" | "danger"
  }
> = {
  pending: { label: "Pending Review", color: "warning" },
  approved: { label: "Approved", color: "success" },
  draft: { label: "Rejected", color: "danger" },
}

export const COMMON_REJECT_REASONS = [
  "Incomplete content",
  "Missing learning objectives",
  "Quality standards not met",
  "Inappropriate content",
  "Needs revision",
  "Does not match course curriculum",
  "Technical errors or issues",
] as const

export const PAGE_SIZE = 20
export const KANBAN_PAGE_SIZE = 100
