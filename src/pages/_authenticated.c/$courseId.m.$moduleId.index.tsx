import { useDeleteModule } from "@/components/modules/hooks/use-module-mutations";
import { ModuleHeader } from "@/components/modules/module-header";
import { ModuleLessonList } from "@/components/modules/module-lesson-list";
import { AccessDenied } from "@/components/shared/access-denied";
import { EditModeHeader } from "@/components/shared/content/edit-mode-header";
import { EditorToolbar } from "@/components/shared/content/editor-toolbar";
import { useModuleEditor } from "@/components/shared/content/hooks/use-module-editor";
import { MarkdownEditor } from "@/components/shared/content/markdown-editor";
import { MarkdownViewer } from "@/components/shared/content/markdown-viewer";
import { EmptyContent } from "@/components/shared/empty/empty-content";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { PreviewBanner } from "@/components/shared/preview/preview-banner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { Editor } from "@tiptap/react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { useCan } from "@/lib/hooks/use-can";
import { createIdParam } from "@/lib/hooks/use-route-params";
import { canViewUnpublishedContent } from "@/lib/rbac/permissions";
import { useUserRole } from "@/lib/rbac/use-user-role";

const moduleSearchSchema = z.object({
  editMode: z.coerce.boolean().default(false),
});

export const Route = createFileRoute("/_authenticated/c/$courseId/m/$moduleId/")({
  params: zodValidator(
    z.object({
      courseId: createIdParam("courses"),
      moduleId: createIdParam("modules"),
    })
  ),
  validateSearch: zodValidator(moduleSearchSchema),
  component: ModulePage,
});

function ModulePage() {
  const { moduleId, courseId } = Route.useParams();
  const { editMode } = Route.useSearch();
  const navigate = useNavigate();
  const userRole = useUserRole();
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const course = useQuery(api.faculty.courses.getCourseById, {
    courseId: courseId as Id<"courses">
  });
  const module = useQuery(api.faculty.modules.getModuleById, {
    moduleId: moduleId as Id<"modules">
  });
  const lessons = useQuery(
    api.faculty.lessons.listLessonsByModule,
    module ? { moduleId: moduleId as Id<"modules"> } : "skip"
  );

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This ensures hooks are called in the same order on every render
  const { execute: deleteModule, isPending: isDeleting } = useDeleteModule();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canView = useCan("view", "module", { status: module?.status });
  const canEdit = useCan("edit", "module", { status: module?.status });
  const canDelete = useCan("delete", "module", { status: module?.status });

  const editor = useModuleEditor(
    moduleId as Id<"modules">,
    module?.content
  );

  // STEP 1: Check loading FIRST
  if (course === undefined || module === undefined || lessons === undefined) {
    return <LoadingPage message="Loading module..." />;
  }

  // STEP 2: Check not found
  if (!course || !module) {
    return <EmptyContent type="module" />;
  }

  // STEP 3: Permission check (now using loaded data)
  if (!canView) {
    return <AccessDenied message="This module is not published yet" />;
  }

  const isPreviewMode =
    userRole &&
    canViewUnpublishedContent(userRole) &&
    module.status !== CONTENT_STATUS.PUBLISHED;

  const handleDelete = async () => {
    const result = await deleteModule({ moduleId: moduleId as Id<"modules"> });
    if (result.success) {
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    navigate({
      to: "/c/$courseId/m/$moduleId",
      params: { courseId, moduleId },
      search: { editMode: true },
    });
  };

  const handleSave = async () => {
    const success = await editor.save();
    if (success) {
      navigate({
        to: "/c/$courseId/m/$moduleId",
        params: { courseId, moduleId },
        search: { editMode: false },
      });
    }
  };

  const handleCancel = () => {
    editor.cancel();
    navigate({
      to: "/c/$courseId/m/$moduleId",
      params: { courseId, moduleId },
      search: { editMode: false },
    });
  };

  return (
    <div className="flex h-full flex-col">
      {isPreviewMode && (
        <PreviewBanner status={module.status} contentType="module" />
      )}

      <div className="shrink-0 border-b bg-background px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <ModuleHeader
            module={module}
            userRole={userRole!}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? () => setShowDeleteDialog(true) : undefined}
          />
          {canEdit && editMode && (
            <div className="flex shrink-0 gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={editor.isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={editor.isSaving || !editor.isDirty}
              >
                {editor.isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Tabs defaultValue="introduction" className="space-y-6">
            <TabsList>
              <TabsTrigger value="introduction">Introduction</TabsTrigger>
              <TabsTrigger value="lessons">Lessons ({lessons?.length ?? 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="introduction" className="space-y-4">
              {!editMode ? (
                <div className="mx-auto max-w-prose pb-[30vh]">
                  <MarkdownViewer markdown={module.content || ""} />
                </div>
              ) : (
                <div className="flex flex-col">
                  <EditModeHeader
                    isSaving={editor.isSaving}
                    isDirty={editor.isDirty}
                    lastSaved={editor.lastSaved}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                  <EditorToolbar editor={editorInstance} />
                  <div className="mx-auto max-w-prose py-6">
                    <MarkdownEditor
                      initialMarkdown={module.content || ""}
                      onUpdate={editor.setMarkdown}
                      onEditorReady={setEditorInstance}
                      placeholder="Describe this module..."
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="lessons">
              <ModuleLessonList
                moduleId={moduleId as Id<"modules">}
                courseId={courseId as Id<"courses">}
                lessons={lessons ?? []}
                userRole={userRole!}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this module and all its lessons. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
