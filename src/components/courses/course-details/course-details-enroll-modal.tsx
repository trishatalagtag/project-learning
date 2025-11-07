import { Button } from "@/components/ui/button"

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal"

import { useCourseDetails } from "./course-details"

export function CourseDetailsEnrollModal() {
  const { course } = useCourseDetails()

  if (!course) return null

  return (
    <Modal>
      <ModalTrigger>
        <Button intent="primary" className="w-full" isDisabled={!course.isEnrollmentOpen}>
          {course.isEnrollmentOpen ? "Enroll Now" : "Enrollment Closed"}
        </Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirm Enrollment</ModalTitle>
          <ModalDescription>Enroll in "{course.title}"</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm">{course.description}</p>
        </ModalBody>
        <ModalFooter>
          <ModalClose>Cancel</ModalClose>
          <Button intent="primary">Confirm Enrollment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
