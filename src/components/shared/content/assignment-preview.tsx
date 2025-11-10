"use client";

import { EmptyContent } from "@/components/shared/empty/empty-content";
import { LoadingSpinner } from "@/components/shared/loading/loading-spinner";
import type { Id } from "@/convex/_generated/dataModel";
import {
    CalendarIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useAssignment } from "./hooks/use-assignment";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AssignmentPreviewProps {
    assignmentId: Id<"assignments">;
}

export function AssignmentPreview({ assignmentId }: AssignmentPreviewProps) {
    const { assignment, isLoading, isNotFound } = useAssignment(assignmentId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isNotFound || !assignment) {
        return <EmptyContent type="lesson" message="Assignment not found" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                {assignment.description && (
                    <p className="text-sm text-muted-foreground mt-2">{assignment.description}</p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                    {assignment.dueDate && (
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Due Date</p>
                                <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                    {assignment.maxPoints && (
                        <div className="flex items-center gap-2 text-sm">
                            <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Points</p>
                                <p className="font-medium">{assignment.maxPoints}</p>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Instructions */}
                {assignment.instructions && (
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Instructions</h4>
                        <div className="prose prose-sm max-w-none">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {assignment.instructions}
                            </p>
                        </div>
                    </div>
                )}

                {/* Submission Settings */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">Submission Settings</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {assignment.submissionType || "file"}
                            </Badge>
                            {assignment.allowLateSubmissions && (
                                <Badge variant="secondary">Late submissions allowed</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

