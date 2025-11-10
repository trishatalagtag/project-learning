import type { Id } from "@/convex/_generated/dataModel";
import { ROLE, type UserRole } from "@/lib/rbac/permissions";
import type { LessonNavigation as LessonNavigationType } from "@/lib/types/navigation";

import { SaveCancelButtonGroup } from "./action-button-groups";
import { AdminActions } from "./admin-actions";
import { FacultyActions } from "./faculty-actions";
import { LearnerActions } from "./learner-actions";
import { LessonNavigation } from "./lesson-navigation";

interface NavigationWithModuleTitle extends LessonNavigationType {
    currentModuleTitle: string;
}

interface RoleActionBarProps {
    role: UserRole;
    courseId: Id<"courses">;
    lessonId: Id<"lessons">;
    moduleId: Id<"modules">;
    lessonStatus: string;
    isEditMode: boolean;
    canEdit: boolean;
    canApprove: boolean;
    // Edit mode handlers
    onSave?: () => void;
    onCancel?: () => void;
    isSaving?: boolean;
    // Action handlers
    onApprove?: () => void;
    onReject?: () => void;
    onEdit: () => void;
    onSubmit: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    onDelete: () => void;
    onMarkComplete: () => void;
    // Loading states
    isApproving?: boolean;
    isSubmitting: boolean;
    isPublishing: boolean;
    isLessonCompleted: boolean;
    isProgressLoading: boolean;
    navigation: NavigationWithModuleTitle;
}

export function RoleActionBar({
    role,
    courseId,
    lessonId,
    moduleId,
    lessonStatus,
    isEditMode,
    canEdit,
    canApprove,
    onSave,
    onCancel,
    isSaving = false,
    onApprove,
    onReject,
    onEdit,
    onSubmit,
    onPublish,
    onUnpublish,
    onDelete,
    onMarkComplete,
    isApproving = false,
    isSubmitting,
    isPublishing,
    isLessonCompleted,
    isProgressLoading,
    navigation,
}: RoleActionBarProps) {
    // EDIT MODE - Save/Cancel buttons
    if (isEditMode && onSave && onCancel) {
        return (
            <div className="space-y-4">
                <SaveCancelButtonGroup onSave={onSave} onCancel={onCancel} isSaving={isSaving} />
            </div>
        );
    }

    // ADMIN VIEW
    if (role === ROLE.ADMIN) {
        return (
            <div className="space-y-4">
                <AdminActions
                    courseId={courseId}
                    moduleId={moduleId}
                    lessonId={lessonId}
                    lessonStatus={lessonStatus}
                    canEdit={canEdit}
                    canApprove={canApprove}
                    onEdit={onEdit}
                    onApprove={onApprove}
                    onReject={onReject}
                    onPublish={onPublish}
                    onUnpublish={onUnpublish}
                    onDelete={onDelete}
                    isApproving={isApproving}
                    isPublishing={isPublishing}
                />

                <LessonNavigation courseId={courseId} {...navigation} />
            </div>
        );
    }

    // FACULTY VIEW
    if (role === ROLE.FACULTY) {
        return (
            <div className="space-y-4">
                <FacultyActions
                    lessonStatus={lessonStatus}
                    onEdit={onEdit}
                    onSubmit={onSubmit}
                    onDelete={onDelete}
                    isSubmitting={isSubmitting}
                />

                <LessonNavigation courseId={courseId} {...navigation} />
            </div>
        );
    }

    // LEARNER VIEW
    return (
        <div className="space-y-3">
            <LearnerActions
                onMarkComplete={onMarkComplete}
                isCompleted={isLessonCompleted}
                isLoading={isProgressLoading}
            />

            <LessonNavigation courseId={courseId} {...navigation} />
        </div>
    );
}
