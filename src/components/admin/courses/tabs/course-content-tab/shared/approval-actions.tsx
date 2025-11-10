import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ApprovalActionsProps {
    onApprove: () => void;
    onReject: () => void;
    isApproving: boolean;
    canApprove?: boolean;
    canReject?: boolean;
    size?: "sm" | "default";
    layout?: "horizontal" | "vertical";
}

export function ApprovalActions({
    onApprove,
    onReject,
    isApproving,
    canApprove = true,
    canReject = true,
    size = "sm",
    layout = "horizontal",
}: ApprovalActionsProps) {
    return (
        <div className={`flex gap-2 ${layout === "vertical" ? "flex-col" : ""}`}>
            <Button
                size={size}
                onClick={(e) => {
                    e.stopPropagation();
                    onApprove();
                }}
                disabled={!canApprove || isApproving}
                className={layout === "vertical" ? "w-full" : "flex-1"}
            >
                {isApproving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="mr-2 h-4 w-4" />
                        Approve
                    </>
                )}
            </Button>
            <Button
                size={size}
                variant="destructive"
                onClick={(e) => {
                    e.stopPropagation();
                    onReject();
                }}
                disabled={!canReject}
                className={layout === "vertical" ? "w-full" : "flex-1"}
            >
                <XCircleIcon className="mr-2 h-4 w-4" />
                Reject
            </Button>
        </div>
    );
}

