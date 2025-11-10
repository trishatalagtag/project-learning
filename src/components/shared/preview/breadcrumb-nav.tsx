import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface BreadcrumbNavProps {
    courseTitle: string;
    moduleTitle?: string;
    lessonTitle?: string;
}

export function BreadcrumbNav({
    courseTitle,
    moduleTitle,
    lessonTitle,
}: BreadcrumbNavProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{courseTitle}</span>
            {moduleTitle && (
                <>
                    <ChevronRightIcon className="h-4 w-4" />
                    <span>{moduleTitle}</span>
                </>
            )}
            {lessonTitle && (
                <>
                    <ChevronRightIcon className="h-4 w-4" />
                    <span className="text-foreground font-medium">{lessonTitle}</span>
                </>
            )}
        </div>
    );
}

