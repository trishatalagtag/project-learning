"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContentType = "module" | "lesson";

interface RejectContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentId: Id<"modules"> | Id<"lessons">;
    contentType: ContentType;
    contentTitle: string;
}

export function RejectContentDialog({
    open,
    onOpenChange,
    contentId,
    contentType,
    contentTitle,
}: RejectContentDialogProps) {
    const rejectContent = useMutation(api.admin.content.rejectContent);
    const [reason, setReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const handleReject = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setIsRejecting(true);
        try {
            await rejectContent({
                contentId,
                contentType,
                reason: reason.trim(),
            });
            toast.success(`${contentType} rejected`);
            onOpenChange(false);
            setReason("");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reject content");
        } finally {
            setIsRejecting(false);
        }
    };

    const handleClose = () => {
        if (!isRejecting) {
            onOpenChange(false);
            setReason("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <XCircleIcon className="h-5 w-5 text-destructive" />
                        Reject {contentType}
                    </DialogTitle>
                    <DialogDescription>
                        Provide a reason for rejecting <strong>{contentTitle}</strong>. This will be visible
                        to the course creator.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="rejection-reason">Rejection Reason</Label>
                        <Textarea
                            id="rejection-reason"
                            placeholder="e.g., Content needs improvement, missing required materials..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            disabled={isRejecting}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Be specific to help the creator understand what needs to be fixed
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isRejecting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={!reason.trim() || isRejecting}
                    >
                        {isRejecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <XCircleIcon className="mr-2 h-4 w-4" />
                                Reject
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
