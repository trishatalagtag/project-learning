import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { Editor } from "@tiptap/react";
import { useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { z } from "zod";

import { AccessDenied } from "@/components/shared/access-denied";
import { ContentHeader } from "@/components/shared/content/content-header";
import { useLessonEditor } from "@/components/shared/content/editor/hooks/use-lesson-editor";
import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor";
import { InlineTOC } from "@/components/shared/content/navigation/inline-toc";
import { TableOfContents } from "@/components/shared/content/navigation/table-of-contents";
import { MarkdownViewer } from "@/components/shared/content/viewer/markdown-viewer";
import { EditorToolbar, TOOLBAR_PRESETS } from "@/components/shared/controls/editor-toolbar"; // ✅ Import presets
import { EmptyContent } from "@/components/shared/empty/empty-content";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { useCourseNavigation } from "@/components/shared/preview/hooks/use-course-navigation";
import { PreviewLayout } from "@/components/shared/preview/preview-layout";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { useCan } from "@/lib/hooks/use-can";
import { createIdParam } from "@/lib/hooks/use-route-params";
import { canViewUnpublishedContent } from "@/lib/rbac/permissions";
import { useUserRole } from "@/lib/rbac/use-user-role";
import type { TocItem } from "@/lib/tiptap/types"; // ✅ Fixed import

const lessonSearchSchema = z.object({
  editMode: z.coerce.boolean().default(false),
});

export const Route = createFileRoute("/_authenticated/c/$courseId/m/$moduleId/lessons/$lessonId")({
  params: zodValidator(
    z.object({
      courseId: createIdParam("courses"),
      moduleId: createIdParam("modules"),
      lessonId: createIdParam("lessons"),
    })
  ),
  validateSearch: lessonSearchSchema,
  component: LessonPage,
});

function LessonPage() {
  const { lessonId, moduleId, courseId } = Route.useParams();
  const { editMode } = Route.useSearch();
  const navigate = useNavigate();
  const userRole = useUserRole();

  // ========================================================================
  // State
  // ========================================================================
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]); // ✅ Renamed from tocAnchors

  // ========================================================================
  // Data Fetching
  // ========================================================================
  const lesson = useQuery(api.faculty.lessons.getLessonById, {
    lessonId: lessonId as Id<"lessons">,
  });

  const { modules } = useCourseNavigation(lessonId as Id<"lessons">);

  // ========================================================================
  // Permissions & Editor
  // ========================================================================
  const canView = useCan("view", "lesson", { status: lesson?.status });
  const canEdit = useCan("edit", "lesson", { status: lesson?.status });

  const editor = useLessonEditor(
    lessonId as Id<"lessons">,
    moduleId as Id<"modules">,
    courseId as Id<"courses">,
    lesson?.content
  );

  // ========================================================================
  // Handlers
  // ========================================================================
  const handleSave = useCallback(async () => {
    const success = await editor.save();
    if (success) {
      navigate({
        to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
        params: { courseId, moduleId, lessonId },
        search: { editMode: false },
      });
    }
  }, [editor, navigate, courseId, moduleId, lessonId]);

  const handleCancel = useCallback(() => {
    editor.cancel();
    navigate({
      to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
      params: { courseId, moduleId, lessonId },
      search: { editMode: false },
    });
  }, [editor, navigate, courseId, moduleId, lessonId]);

  // ========================================================================
  // Loading & Error States
  // ========================================================================
  if (lesson === undefined || modules === undefined) {
    return <LoadingPage message="Loading lesson..." />;
  }

  if (!lesson) {
    return <EmptyContent type="lesson" />;
  }

  if (!canView) {
    return <AccessDenied message="This lesson is not published yet" />;
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

  const config = statusConfig[lesson.status as keyof typeof statusConfig] || statusConfig.draft;
  const showPreviewBanner =
    userRole && canViewUnpublishedContent(userRole) && lesson.status !== CONTENT_STATUS.PUBLISHED;

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <PreviewLayout
      courseId={courseId as Id<"courses">}
      modules={modules}
      currentLessonId={lessonId as Id<"lessons">}
      currentModuleId={moduleId as Id<"modules">}
      contentStatus={lesson.status}
      contentType="lesson"
      breadcrumb={{
        courseTitle: lesson.courseName,
        moduleTitle: lesson.moduleName,
        lessonTitle: lesson.title,
      }}
      isEditMode={editMode && canEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={editor.isSaving}
      tableOfContents={
        tocItems.length > 0 ? (
          <TableOfContents anchors={tocItems} title={lesson.title} />
        ) : null
      }
    >
      {editMode && canEdit && (
        <EditorToolbar
          editor={editorInstance}
          isSaving={editor.isSaving}
          isDirty={editor.isDirty}
          lastSaved={editor.lastSaved}
          onSave={handleSave}
          onCancel={handleCancel}
          config={TOOLBAR_PRESETS.full} // ✅ Use preset
          className="mb-6"
        />
      )}

      <div className="container mx-auto max-w-prose px-4 py-8 sm:px-8 sm:py-16">
        {editMode && canEdit ? (
          <div className="flex h-full flex-col gap-6">
            <ContentHeader
              title={lesson.title}
              statusBadge={
                showPreviewBanner ? (
                  <Badge variant={config.variant} className="capitalize">
                    {config.label}
                  </Badge>
                ) : undefined
              }
              description={lesson.description}
              variant="lesson"
            />

            {/* Mobile TOC */}
            {tocItems.length > 0 && (
              <InlineTOC anchors={tocItems} className="xl:hidden" />
            )}

            <MarkdownEditor
              initialMarkdown={lesson.content || ""}
              onUpdate={editor.setMarkdown}
              onEditorReady={setEditorInstance}
              onTocUpdate={setTocItems} // ✅ Fixed callback
              placeholder="Start typing your lesson content..."
              className="flex-1"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <ContentHeader
              title={lesson.title}
              description={lesson.description}
              statusBadge={
                showPreviewBanner ? (
                  <Badge variant={config.variant} className="capitalize">
                    {config.label}
                  </Badge>
                ) : undefined
              }
              variant="lesson"
            />

            {/* Mobile TOC */}
            {tocItems.length > 0 && (
              <InlineTOC anchors={tocItems} className="xl:hidden" />
            )}

            <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none">
              <MarkdownViewer
                markdown={lesson.content || ""}
                onTocUpdate={setTocItems} // ✅ Fixed callback
              />
            </div>
          </div>
        )}
      </div>
    </PreviewLayout>
  );
}