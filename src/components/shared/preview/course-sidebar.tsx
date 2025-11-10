import {
    BookOpenIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    PlayIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { ContentStatus } from "@/lib/constants/content-status";
import { CONTENT_STATUS, STATUS_CONFIG } from "@/lib/constants/content-status";
import { canViewUnpublishedContent } from "@/lib/rbac/permissions";
import { useUserRole } from "@/lib/rbac/use-user-role";
import type { ModuleWithLessons } from "@/lib/types/navigation";

import type { Id } from "@/convex/_generated/dataModel";

interface CourseSidebarProps {
    courseId: Id<"courses">;
    courseTitle: string;
    modules: ModuleWithLessons[];
    currentLessonId?: string;
    currentModuleId?: string;
}

export function CourseSidebar({
    courseId,
    courseTitle,
    modules,
    currentLessonId,
    currentModuleId,
}: CourseSidebarProps) {
    const userRole = useUserRole();
    const showUnpublished = userRole ? canViewUnpublishedContent(userRole) : false;

    const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
        // Auto-expand current module
        if (currentModuleId) {
            return new Set([currentModuleId]);
        }
        // Auto-expand module containing current lesson
        const moduleWithLesson = modules.find((m) =>
            m.lessons?.some((l) => l._id === currentLessonId),
        );
        return moduleWithLesson ? new Set([moduleWithLesson._id]) : new Set();
    });

    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(moduleId)) {
                next.delete(moduleId);
            } else {
                next.add(moduleId);
            }
            return next;
        });
    };

    return (
        <div className="w-80 border-r bg-muted/30 flex flex-col h-full">
            <div className="p-4 border-b bg-background">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BookOpenIcon className="h-4 w-4" />
                    <span>Course Content</span>
                </div>
                <h2 className="font-semibold text-base">{courseTitle}</h2>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {modules.map((module) => {
                        const isExpanded = expandedModules.has(module._id);
                        const config = STATUS_CONFIG[module.status as ContentStatus];

                        return (
                            <div key={module._id} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 justify-start h-auto p-2"
                                        onClick={() => toggleModule(module._id)}
                                    >
                                        {isExpanded ? (
                                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                                        ) : (
                                            <ChevronRightIcon className="h-4 w-4 mr-1" />
                                        )}
                                        <span className="font-medium text-sm">{module.title}</span>
                                        {showUnpublished && module.status !== CONTENT_STATUS.PUBLISHED && (
                                            <Badge variant={config.variant} className="ml-auto text-xs">
                                                {config.label}
                                            </Badge>
                                        )}
                                    </Button>
                                </div>

                                {isExpanded && module.lessons && module.lessons.length > 0 && (
                                    <div className="ml-6 space-y-1">
                                        {module.lessons.map((lesson) => {
                                            const isCurrentLesson = lesson._id === currentLessonId;
                                            const lessonConfig = STATUS_CONFIG[lesson.status as ContentStatus];

                                            return (
                                                <Link
                                                    key={lesson._id}
                                                    to="/c/$courseId/m/$moduleId/lessons/$lessonId"
                                                    params={{ courseId, moduleId: lesson.moduleId, lessonId: lesson._id }}
                                                    className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${isCurrentLesson
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "hover:bg-accent/50 text-muted-foreground"
                                                        }`}
                                                >
                                                    <PlayIcon className="h-3 w-3 shrink-0" />
                                                    <span className="truncate flex-1">{lesson.title}</span>
                                                    {showUnpublished && lesson.status !== CONTENT_STATUS.PUBLISHED && (
                                                        <Badge variant={lessonConfig.variant} className="text-xs shrink-0">
                                                            {lessonConfig.label}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
