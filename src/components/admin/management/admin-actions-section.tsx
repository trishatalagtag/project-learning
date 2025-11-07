"use client"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Label } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Modal,
    ModalBody,
    ModalClose,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/modal"
import { Text } from "@/components/ui/text"
import { TextField } from "@/components/ui/text-field"
import { useState } from "react"
import { toast } from "sonner"

interface AdminActionsSectionProps {
    currentStatus: string
    onApprove: () => Promise<void>
    onReject: (reason: string) => Promise<void>
    onPublish: () => Promise<void>
    onUnpublish: () => Promise<void>
    onDelete: () => Promise<void>
}

export function AdminActionsSection({
    currentStatus,
    onApprove,
    onReject,
    onPublish,
    onUnpublish,
    onDelete,
}: AdminActionsSectionProps) {
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [isPending, setIsPending] = useState(false)

    const handleApprove = async () => {
        setIsPending(true)
        try {
            await onApprove()
            toast.success("Course approved successfully")
        } catch (_error) {
            toast.error("Failed to approve course")
        } finally {
            setIsPending(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection")
            return
        }

        setIsPending(true)
        try {
            await onReject(rejectReason)
            toast.success("Course rejected")
            setIsRejectModalOpen(false)
            setRejectReason("")
        } catch (_error) {
            toast.error("Failed to reject course")
        } finally {
            setIsPending(false)
        }
    }

    const handlePublish = async () => {
        if (currentStatus !== "approved") {
            setIsPublishModalOpen(true)
            return
        }

        setIsPending(true)
        try {
            await onPublish()
            toast.success("Course published successfully")
        } catch {
            toast.error("Failed to publish course")
        } finally {
            setIsPending(false)
        }
    }

    const handleApproveAndPublish = async () => {
        setIsPending(true)
        try {
            await onApprove()
            await onPublish()
            toast.success("Course approved and published successfully")
            setIsPublishModalOpen(false)
        } catch {
            toast.error("Failed to approve and publish course")
        } finally {
            setIsPending(false)
        }
    }

    const handleUnpublish = async () => {
        setIsPending(true)
        try {
            await onUnpublish()
            toast.success("Course unpublished")
        } catch (_error) {
            toast.error("Failed to unpublish course")
        } finally {
            setIsPending(false)
        }
    }

    const handleDelete = async () => {
        setIsPending(true)
        try {
            await onDelete()
            toast.success("Course deleted successfully")
            setIsDeleteModalOpen(false)
        } catch (_error) {
            toast.error("Failed to delete course")
        } finally {
            setIsPending(false)
        }
    }

    const getStatusInfo = () => {
        switch (currentStatus.toLowerCase()) {
            case "published":
                return {
                    label: "Published",
                    description: "This course is live and visible to students.",
                    intent: "success" as const,
                }
            case "approved":
                return {
                    label: "Approved",
                    description: "This course is approved but not yet published.",
                    intent: "info" as const,
                }
            case "pending":
                return {
                    label: "Pending Review",
                    description: "This course is awaiting approval.",
                    intent: "warning" as const,
                }
            case "rejected":
                return {
                    label: "Rejected",
                    description: "This course has been rejected and needs revision.",
                    intent: "danger" as const,
                }
            default:
                return {
                    label: currentStatus,
                    description: "Current course status.",
                    intent: "secondary" as const,
                }
        }
    }

    const statusInfo = getStatusInfo()

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Text className="text-muted-foreground text-sm">Current Status</Text>
                        <Text className="mt-1 font-semibold text-lg">{statusInfo.label}</Text>
                        <Text className="mt-1 text-muted-foreground text-sm">
                            {statusInfo.description}
                        </Text>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Text className="mb-3 font-medium text-muted-foreground text-sm">
                        Approval Actions
                    </Text>
                    <ButtonGroup>
                        <Button
                            intent="primary"
                            onPress={handleApprove}
                            isPending={isPending}
                            isDisabled={currentStatus === "approved"}
                        >
                            Approve
                        </Button>
                        <Button
                            intent="warning"
                            onPress={() => setIsRejectModalOpen(true)}
                            isDisabled={currentStatus === "rejected"}
                        >
                            Reject
                        </Button>
                    </ButtonGroup>
                </div>

                <div>
                    <Text className="mb-3 font-medium text-muted-foreground text-sm">
                        Publishing Actions
                    </Text>
                    <ButtonGroup>
                        <Button
                            intent="secondary"
                            onPress={handlePublish}
                            isPending={isPending}
                            isDisabled={currentStatus === "published"}
                        >
                            Publish
                        </Button>
                        <Button
                            intent="outline"
                            onPress={handleUnpublish}
                            isDisabled={currentStatus !== "published"}
                        >
                            Unpublish
                        </Button>
                    </ButtonGroup>
                </div>

                <div>
                    <Text className="mb-3 font-medium text-muted-foreground text-sm">
                        Danger Zone
                    </Text>
                    <Button
                        intent="danger"
                        onPress={() => setIsDeleteModalOpen(true)}
                    >
                        Delete Course
                    </Button>
                </div>
            </div>

            {/* Reject Modal */}
            <Modal isOpen={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <ModalContent role="alertdialog">
                    <ModalHeader>
                        <ModalTitle>Reject Course</ModalTitle>
                        <ModalDescription>
                            Please provide a reason for rejecting this course. This will be communicated to the instructor.
                        </ModalDescription>
                    </ModalHeader>
                    <ModalBody>
                        <TextField isRequired>
                            <Label>Reason for Rejection</Label>
                            <Input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Content does not meet quality standards..."
                            />
                        </TextField>
                    </ModalBody>
                    <ModalFooter>
                        <ModalClose>Cancel</ModalClose>
                        <Button
                            intent="warning"
                            onPress={handleReject}
                            isPending={isPending}
                        >
                            Reject Course
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <ModalContent role="alertdialog">
                    <ModalHeader>
                        <ModalTitle>Delete Course</ModalTitle>
                        <ModalDescription>
                            Are you sure you want to delete this course? This action cannot be undone and will remove all associated data.
                        </ModalDescription>
                    </ModalHeader>
                    <ModalBody>
                        <div className="rounded-lg bg-danger/10 p-4">
                            <p className="text-danger text-sm">
                                This will permanently delete the course, all modules, enrollments, and student progress.
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalClose>Cancel</ModalClose>
                        <Button
                            intent="danger"
                            onPress={handleDelete}
                            isPending={isPending}
                        >
                            Delete Permanently
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Publish Approval Modal */}
            <Modal isOpen={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
                <ModalContent role="alertdialog">
                    <ModalHeader>
                        <ModalTitle>Approve Before Publishing</ModalTitle>
                        <ModalDescription>
                            This course must be approved before it can be published. Would you like to approve and publish it now?
                        </ModalDescription>
                    </ModalHeader>
                    <ModalBody>
                        <div className="rounded-lg bg-info/10 p-4">
                            <p className="text-info text-sm">
                                The course status is currently "{currentStatus}". It needs to be "approved" before publishing.
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalClose>Cancel</ModalClose>
                        <Button
                            intent="primary"
                            onPress={handleApproveAndPublish}
                            isPending={isPending}
                        >
                            Approve & Publish
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
