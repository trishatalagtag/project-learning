import { useDeleteModule } from "@/components/modules/hooks/use-module-mutations";
import { ModuleLessonList } from "@/components/modules/module-lesson-list";
import { AccessDenied } from "@/components/shared/access-denied";
import { ContentHeader } from "@/components/shared/content/content-header";
import { useModuleEditor } from "@/components/shared/content/editor/hooks/use-module-editor";
import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor";
import { InlineTOC } from "@/components/shared/content/navigation/inline-toc"; // ✅ Added TOC
import { TableOfContents } from "@/components/shared/content/navigation/table-of-contents"; // ✅ Added TOC
import { MarkdownViewer } from "@/components/shared/content/viewer/markdown-viewer";
import { EditorToolbar, TOOLBAR_PRESETS } from "@/components/shared/controls/editor-toolbar";
import { EmptyContent } from "@/components/shared/empty/empty-content";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { PreviewLayout } from "@/components/structure/preview-layout";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createIdParam } from "@/hooks/use-route-params";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { canViewUnpublishedContent } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-can";
import { useUserRole } from "@/lib/rbac/use-user-role";
import type { TocItem } from "@/lib/tiptap/types"; // ✅ Fixed import
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { Editor } from "@tiptap/react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { z } from "zod";

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

  // ========================================================================
  // State
  // ========================================================================
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]); // ✅ Added TOC
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ========================================================================
  // Data Fetching
  // ========================================================================
  const course = useQuery(api.faculty.courses.getCourseById, {
    courseId: courseId as Id<"courses">,
  });
  const module = useQuery(api.faculty.modules.getModuleById, {
    moduleId: moduleId as Id<"modules">,
  });
  const modules = useQuery(
    api.shared.content.getModulesWithLessons,
    course ? { courseId: courseId as Id<"courses"> } : "skip"
  );
  const lessons = useQuery(
    api.faculty.lessons.listLessonsByModule,
    module ? { moduleId: moduleId as Id<"modules"> } : "skip"
  );

  // ========================================================================
  // Permissions & Editor
  // ========================================================================
  const { execute: deleteModule, isPending: isDeleting } = useDeleteModule();
  const canView = useCan("view", "module", { status: module?.status });
  const canEdit = useCan("edit", "module", { status: module?.status });

  const editor = useModuleEditor(moduleId as Id<"modules">, module?.content);

  // ========================================================================
  // Handlers
  // ========================================================================
  const handleDelete = useCallback(async () => {
    const result = await deleteModule({ moduleId: moduleId as Id<"modules"> });
    if (result.success) {
      setShowDeleteDialog(false);
      navigate({ to: "/c/$courseId", params: { courseId } });
    }
  }, [deleteModule, moduleId, navigate, courseId]);

  const handleSave = useCallback(async () => {
    const success = await editor.save();
    if (success) {
      navigate({
        to: "/c/$courseId/m/$moduleId",
        params: { courseId, moduleId },
        search: { editMode: false },
      });
    }
  }, [editor, navigate, courseId, moduleId]);

  const handleCancel = useCallback(() => {
    editor.cancel();
    navigate({
      to: "/c/$courseId/m/$moduleId",
      params: { courseId, moduleId },
      search: { editMode: false },
    });
  }, [editor, navigate, courseId, moduleId]);

  // ========================================================================
  // Loading & Error States
  // ========================================================================
  if (
    course === undefined ||
    module === undefined ||
    modules === undefined ||
    lessons === undefined
  ) {
    return <LoadingPage message="Loading module..." />;
  }

  if (!course || !module) {
    return <EmptyContent type="module" />;
  }

  if (!canView) {
    return <AccessDenied message="This module is not published yet" />;
  }

  // ========================================================================
  // Status Config
  // ========================================================================
  const statusConfig = {
    draft: { variant: "secondary" as const, label: "Draft" },
    pending: { variant: "outline" as const, label: "Pending Review" },
    approved: { variant: "default" as const, label: "Approved" },
    published: { variant: "default" as const, label: "Published" },
  };

  const config =
    statusConfig[module.status as keyof typeof statusConfig] || statusConfig.draft;
  const showPreviewBanner =
    userRole &&
    canViewUnpublishedContent(userRole) &&
    module.status !== CONTENT_STATUS.PUBLISHED;

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <>
      <PreviewLayout
        courseId={courseId as Id<"courses">}
        modules={modules || []}
        currentModuleId={moduleId as Id<"modules">}
        contentStatus={module.status}
        contentType="module"
        breadcrumb={{
          courseTitle: course.title,
          moduleTitle: module.title,
        }}
        isEditMode={editMode && canEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={editor.isSaving}
        tableOfContents={
          tocItems.length > 0 ? (
            <TableOfContents anchors={tocItems} title={module.title} />
          ) : null
        } // ✅ Added TOC
      >
        <ContentHeader
          title={module.title}
          description={module.description}
          statusBadge={
            showPreviewBanner ? (
              <Badge variant={config.variant} className="capitalize">
                {config.label}
              </Badge>
            ) : undefined
          }
          variant="module"
        />

        <div className="container mx-auto max-w-prose px-4 py-8">

          {/* Mobile TOC */}
          {tocItems.length > 0 && (
            <InlineTOC anchors={tocItems} className="mb-6 xl:hidden" />
          )}

          <section className="pb-4">
            {!editMode ? (
              <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none">
                <MarkdownViewer
                  markdown={module.content || ""}
                  onTocUpdate={setTocItems} // ✅ Added TOC
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <EditorToolbar
                  editor={editorInstance}
                  isSaving={editor.isSaving}
                  isDirty={editor.isDirty}
                  lastSaved={editor.lastSaved}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  config={TOOLBAR_PRESETS.full}
                />
                <MarkdownEditor
                  initialMarkdown={module.content || ""}
                  onUpdate={editor.setMarkdown}
                  onEditorReady={setEditorInstance}
                  onTocUpdate={setTocItems} // ✅ Added TOC
                  placeholder="Describe this module..."
                />
              </div>
            )}
          </section>

          <section className="pb-4">
            <ModuleLessonList
              moduleId={moduleId as Id<"modules">}
              courseId={courseId as Id<"courses">}
              lessons={lessons ?? []}
              userRole={userRole!}
            />
          </section>
        </div>
      </PreviewLayout>

      {/* Delete Dialog */}
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
    </>
  );
}