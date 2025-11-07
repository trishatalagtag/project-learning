"use client"

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
} from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { memo } from "react"
import { COMMON_REJECT_REASONS } from "../config"
import type { ContentItem } from "../types"
import { getItemDisplayTitle } from "../utils"

interface RejectDialogProps {
    item: ContentItem | null
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    reason: string
    onReasonChange: (reason: string) => void
    isProcessing: boolean
}

export const RejectDialog = memo(function RejectDialog({
    item,
    isOpen,
    onClose,
    onConfirm,
    reason,
    onReasonChange,
    isProcessing,
}: RejectDialogProps) {
    if (!item) return null

    const displayTitle = getItemDisplayTitle(item)

    return (
        <Modal>
            <ModalContent
                isOpen={isOpen}
                onOpenChange={(open) => !open && onClose()}
                size="lg"
                role="alertdialog"
                isBlurred
            >
                <ModalHeader>
                    <ModalTitle>Reject "{displayTitle}"?</ModalTitle>
                    <ModalDescription>
                        This will notify {item.createdByName || "the creator"} and require resubmission.
                        Please provide a reason for rejection.
                    </ModalDescription>
                </ModalHeader>
                <ModalBody className="space-y-4">
                    <div>
                        <label htmlFor="reject-reason" className="mb-2 block font-medium text-sm">
                            Reason for rejection <span className="text-danger">*</span>
                        </label>
                        <Textarea
                            id="reject-reason"
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="Enter a detailed reason for rejection..."
                            rows={4}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <p className="mb-2 font-medium text-sm">Common reasons:</p>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_REJECT_REASONS.map((commonReason) => (
                                <Button
                                    key={commonReason}
                                    size="sm"
                                    intent="outline"
                                    onPress={() => onReasonChange(commonReason)}
                                >
                                    {commonReason}
                                </Button>
                            ))}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <ModalClose isDisabled={isProcessing}>Cancel</ModalClose>
                    <Button
                        intent="danger"
                        onPress={onConfirm}
                        isPending={isProcessing}
                        isDisabled={isProcessing || !reason.trim()}
                    >
                        Reject and Notify
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
})

