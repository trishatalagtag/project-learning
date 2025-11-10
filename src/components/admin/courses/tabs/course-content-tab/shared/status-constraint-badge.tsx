import type { api } from "@/convex/_generated/api";
import { InformationCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { FunctionReturnType } from "convex/server";

import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { STATUS_CONFIG } from "@/lib/constants/content-status";

type Status = FunctionReturnType<
    typeof api.faculty.modules.listModulesByCourse
>[number]["status"];

interface StatusConstraintBadgeProps {
    moduleStatus: Status;
    moduleTitle: string;
}

export function StatusConstraintBadge({
    moduleStatus,
    moduleTitle,
}: StatusConstraintBadgeProps) {
    const statusConfig = STATUS_CONFIG[moduleStatus as keyof typeof STATUS_CONFIG];
    const statusLabel = statusConfig?.label || moduleStatus;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1.5 cursor-help">
                        <LockClosedIcon className="h-3 w-3" />
                        <span>Max: {statusLabel}</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <InformationCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-medium">Status Constraint</p>
                                <p className="text-xs text-muted-foreground">
                                    This lesson cannot exceed the parent module's status.
                                </p>
                            </div>
                        </div>
                        <div className="text-xs bg-muted/50 p-2 rounded">
                            <p className="font-medium mb-1">Parent Module:</p>
                            <p className="text-muted-foreground">{moduleTitle}</p>
                            <p className="text-muted-foreground">
                                Status: <span className="font-medium">{statusLabel}</span>
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Update the module status first to unlock higher levels.
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

