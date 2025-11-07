"use client"

import { Badge } from "@/components/ui/badge"
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "@/components/ui/description-list"
import {
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal"
import type { JSX } from "react"
import type { PendingContentItem, PendingCourse } from "./types"

interface PreviewModalProps {
  item: PendingCourse | PendingContentItem | null
  onClose: () => void
}

export function PreviewModal({ item, onClose }: PreviewModalProps): JSX.Element | null {
  if (!item) return null

  const isCourse = "description" in item && !("type" in item)

  return (
    <ModalContent isOpen={!!item} onOpenChange={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>{item.title}</ModalTitle>
        <ModalDescription>
          {isCourse ? "Course Preview" : `${capitalize((item as PendingContentItem).type)} Preview`}
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        <DescriptionList>
          {isCourse ? (
            <>
              <DescriptionTerm>Description</DescriptionTerm>
              <DescriptionDetails>{(item as PendingCourse).description}</DescriptionDetails>

              <DescriptionTerm>Category</DescriptionTerm>
              <DescriptionDetails>
                <Badge intent="info">{(item as PendingCourse).categoryName}</Badge>
              </DescriptionDetails>

              <DescriptionTerm>Instructor</DescriptionTerm>
              <DescriptionDetails>
                {(item as PendingCourse).teacherName || (item as PendingCourse).createdByName}
              </DescriptionDetails>
            </>
          ) : (
            <>
              <DescriptionTerm>Type</DescriptionTerm>
              <DescriptionDetails>
                <Badge>{capitalize((item as PendingContentItem).type)}</Badge>
              </DescriptionDetails>

              <DescriptionTerm>Course</DescriptionTerm>
              <DescriptionDetails>{(item as PendingContentItem).courseName}</DescriptionDetails>

              {(item as PendingContentItem).type === "lesson" && "moduleName" in item && (
                <>
                  <DescriptionTerm>Module</DescriptionTerm>
                  <DescriptionDetails>{item.moduleName}</DescriptionDetails>
                </>
              )}

              <DescriptionTerm>Creator</DescriptionTerm>
              <DescriptionDetails>{item.createdByName || "Unknown"}</DescriptionDetails>
            </>
          )}

          <DescriptionTerm>Submitted</DescriptionTerm>
          <DescriptionDetails>{formatDateTime(item.createdAt)}</DescriptionDetails>
        </DescriptionList>
      </ModalBody>

      <ModalFooter>
        <ModalClose>Close</ModalClose>
      </ModalFooter>
    </ModalContent>
  )
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
