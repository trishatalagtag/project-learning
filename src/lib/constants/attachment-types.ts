import type { Doc } from "@/convex/_generated/dataModel";

export const ATTACHMENT_TYPE = {
  VIDEO: "video",
  QUIZ: "quiz",
  ASSIGNMENT: "assignment",
  GUIDE: "guide",
  RESOURCE: "resource",
} as const;

// Infer from backend schema
export type AttachmentType = Doc<"lessonAttachments">["type"];

export const ATTACHMENT_TYPE_CONFIG: Record<
  AttachmentType,
  { label: string; icon: string }
> = {
  [ATTACHMENT_TYPE.VIDEO]: { label: "Video", icon: "PlayCircleIcon" },
  [ATTACHMENT_TYPE.QUIZ]: { label: "Quiz", icon: "QuestionMarkCircleIcon" },
  [ATTACHMENT_TYPE.ASSIGNMENT]: { label: "Assignment", icon: "AcademicCapIcon" },
  [ATTACHMENT_TYPE.GUIDE]: { label: "Guide", icon: "DocumentTextIcon" },
  [ATTACHMENT_TYPE.RESOURCE]: { label: "Resource", icon: "FolderIcon" },
};

