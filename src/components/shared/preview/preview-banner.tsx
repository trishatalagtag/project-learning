import { StatusBadge } from "@/components/shared/status/status-badge";
import type { ContentStatus } from "@/lib/constants/content-status";
import { EyeIcon } from "@heroicons/react/24/outline";

interface PreviewBannerProps {
    status: ContentStatus;
    contentType: "lesson" | "module" | "course";
}

export function PreviewBanner({ status, contentType: _contentType }: PreviewBannerProps) {
    return (
        <div className="border-b border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <EyeIcon className="h-5 w-5 text-yellow-700 dark:text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-1">
                            Preview Mode
                        </div>
                        <div className="text-xs text-yellow-700 dark:text-yellow-300">
                            This content is not visible to learners
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <StatusBadge status={status} showIcon className="capitalize" />
                </div>
            </div>
        </div>
    );
}