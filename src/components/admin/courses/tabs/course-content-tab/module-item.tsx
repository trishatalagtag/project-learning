"use client";

import { api } from "@/convex/_generated/api";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { EmptyLessons } from "@/components/shared/empty/empty-lessons";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { useContentApproval } from "./hooks/use-content-approval";
import { LessonItem } from "./lesson-item";
import { RejectContentDialog } from "./reject-content-dialog";
import { ApprovalActions } from "./shared/approval-actions";
import { ContentMetadata } from "./shared/content-metadata";
import { StatusBadge } from "./shared/status-badge";

import type { Id } from "@/convex/_generated/dataModel";

type Module = FunctionReturnType<
    typeof api.faculty.modules.listModulesByCourse
>[number];

interface ModuleItemProps {
    module: Module;
    courseId: Id<"courses">;
    moduleNumber: number;
    isExpanded: boolean;
    onToggle: () => void;
}

export function ModuleItem({
    module,
    courseId,
    moduleNumber,
    isExpanded,
    onToggle,
}: ModuleItemProps) {
    const lessons = useQuery(
        api.faculty.lessons.listLessonsByModule,
        isExpanded ? { moduleId: module._id } : "skip"
    );

    const {
        isApproving,
        showRejectDialog,
        setShowRejectDialog,
        handleApprove,
        handleReject,
    } = useContentApproval({
        contentId: module._id,
        contentType: "module",
    });

    const isPending = module.status === CONTENT_STATUS.PENDING;

    return (
        <>
            <Collapsible open={isExpanded} onOpenChange={onToggle}>
                <Card
                    className={`transition-all hover:border-primary/50 ${isPending ? "border-orange-500/30 bg-orange-500/5" : ""
                        }`}
                >
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 px-4 py-4 h-auto hover:bg-transparent"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {isExpanded ? (
                                        <ChevronDownIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                                    ) : (
                                        <ChevronRightIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                                        {moduleNumber}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-base truncate">{module.title}</h3>
                                            <StatusBadge status={module.status} className="capitalize shrink-0" />
                                        </div>
                                        {module.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                {module.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <DocumentTextIcon className="h-3.5 w-3.5" />
                                                <span>
                                                    {module.lessonCount} {module.lessonCount === 1 ? "lesson" : "lessons"}
                                                </span>
                                            </div>
                                            <ContentMetadata createdAt={module.createdAt} updatedAt={module.updatedAt} />
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        </CollapsibleTrigger>
                    </CardHeader>

                    {isPending && (
                        <div className="px-4 pb-3">
                            <ApprovalActions
                                onApprove={handleApprove}
                                onReject={handleReject}
                                isApproving={isApproving}
                                layout="horizontal"
                            />
                        </div>
                    )}

                    <CollapsibleContent>
                        <div className="border-t bg-muted/30">
                            {module.description && (
                                <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                    <div className="flex items-start gap-2">
                                        <InformationCircleIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium mb-1">Module Description</p>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {lessons === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Loading lessons...</span>
                                    </div>
                                </div>
                            ) : lessons.length === 0 ? (
                                <div className="py-8 px-4">
                                    <EmptyLessons moduleId={module._id} canCreate={false} />
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {lessons.map((lesson, index) => (
                                        <LessonItem
                                            key={lesson._id}
                                            lesson={lesson}
                                            courseId={courseId}
                                            lessonNumber={index + 1}
                                            moduleStatus={module.status as Module["status"]}
                                            moduleTitle={module.title}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <RejectContentDialog
                open={showRejectDialog}
                onOpenChange={setShowRejectDialog}
                contentId={module._id}
                contentType="module"
                contentTitle={module.title}
            />
        </>
    );
}
