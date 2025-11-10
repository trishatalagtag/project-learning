"use client";

import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
    isSaving: boolean;
    lastSaved: Date | null;
}

export function AutoSaveIndicator({ isSaving, lastSaved }: AutoSaveIndicatorProps) {
    if (isSaving) {
        return (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
            </span>
        );
    }

    if (lastSaved) {
        return (
            <span className="text-muted-foreground text-xs">
                Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </span>
        );
    }

    return null;
}

