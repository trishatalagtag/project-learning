"use client";

import { api } from "@/convex/_generated/api";
import {
    ChevronDownIcon,
    DocumentTextIcon,
    EyeIcon,
    InformationCircleIcon,
    PaperClipIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type { FunctionReturnType } from "convex/server";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { useContentApproval } from "./hooks/use-content-approval";
import { RejectContentDialog } from "./reject-content-dialog";
import { ApprovalActions } from "./shared/approval-actions";
import { ContentMetadata } from "./shared/content-metadata";
import { StatusBadge } from "./shared/status-badge";
import { StatusConstraintBadge } from "./shared/status-constraint-badge";

type Lesson = FunctionReturnType<
    typeof api.faculty.lessons.listLessonsByModule
>[number];

import type { Id } from "@/convex/_generated/dataModel";

type ModuleStatus = FunctionReturnType<
    typeof api.faculty.modules.listModulesByCourse
>[number]["status"];

interface LessonItemProps {
    lesson: Lesson;
    courseId: Id<"courses">;
    lessonNumber: number;
    moduleStatus: ModuleStatus;
    moduleTitle: string;
}

export function LessonItem({ lesson, courseId, lessonNumber, moduleStatus, moduleTitle }: LessonItemProps) {
    const [showDetails, setShowDetails] = useState(false);

    const {
        isApproving,
        showRejectDialog,
        setShowRejectDialog,
        handleApprove,
        handleReject,
    } = useContentApproval({
        contentId: lesson._id,
        contentType: "lesson",
    });

    const isPending = lesson.status === CONTENT_STATUS.PENDING;

    return (
        <>
            <div
                className={`group hover:bg-muted/50 transition-colors ${isPending ? "bg-orange-500/5" : ""
                    }`}
            >
                <div className="flex items-start gap-3 px-4 py-3 pl-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted border border-border text-xs font-medium text-muted-foreground">
                        {lessonNumber}
                    </div>

                    <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary">
                        <DocumentTextIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-sm">{lesson.title}</h4>
                                    <StatusBadge status={lesson.status} className="capitalize text-xs" />

                                    {/* Preview button */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    to="/c/$courseId/m/$moduleId/lessons/$lessonId"
                                                    params={{ courseId, moduleId: lesson.moduleId, lessonId: lesson._id }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2"
                                                    >
                                                        <EyeIcon className="h-3.5 w-3.5 mr-1" />
                                                        <span className="text-xs">View</span>
                                                    </Button>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Preview lesson content</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {isPending && (
                                        <StatusConstraintBadge moduleStatus={moduleStatus} moduleTitle={moduleTitle} />
                                    )}
                                </div>

                                {lesson.description && !showDetails && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {lesson.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                    {lesson.attachmentCount > 0 && (
                                        <div className="flex items-center gap-1">
                                            <PaperClipIcon className="h-3.5 w-3.5" />
                                            <span>
                                                {lesson.attachmentCount}{" "}
                                                {lesson.attachmentCount === 1 ? "attachment" : "attachments"}
                                            </span>
                                        </div>
                                    )}
                                    <ContentMetadata createdAt={lesson.createdAt} updatedAt={lesson.updatedAt} />
                                </div>

                                {lesson.description && showDetails && (
                                    <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                                        <p className="text-xs font-medium mb-1">Lesson Description</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {lesson.description}
                                        </p>
                                    </div>
                                )}

                                {isPending && (
                                    <div className="mt-3">
                                        <ApprovalActions
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            isApproving={isApproving}
                                            size="sm"
                                        />
                                    </div>
                                )}
                            </div>

                            {lesson.description && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowDetails(!showDetails);
                                                }}
                                            >
                                                {showDetails ? (
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                ) : (
                                                    <InformationCircleIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{showDetails ? "Hide details" : "Show details"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RejectContentDialog
                open={showRejectDialog}
                onOpenChange={setShowRejectDialog}
                contentId={lesson._id}
                contentType="lesson"
                contentTitle={lesson.title}
            />
        </>
    );
}
