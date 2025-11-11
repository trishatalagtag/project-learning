import { AccessDenied } from "@/components/shared/access-denied";
import { ContentHeader } from "@/components/shared/content/content-header";
import { CourseHero } from "@/components/shared/content/course-hero";
import { useCourseEditor } from "@/components/shared/content/editor/hooks/use-course-editor";
import { MarkdownEditor } from "@/components/shared/content/editor/markdown-editor";
import { InlineTOC } from "@/components/shared/content/navigation/inline-toc"; // ✅ Added TOC
import { TableOfContents } from "@/components/shared/content/navigation/table-of-contents"; // ✅ Added TOC
import { MarkdownViewer } from "@/components/shared/content/viewer/markdown-viewer";
import { EditorToolbar, TOOLBAR_PRESETS } from "@/components/shared/controls/editor-toolbar";
import { CourseLearningCard } from "@/components/shared/course-learning-card";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { PreviewLayout } from "@/components/structure/preview-layout";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useFileUrl } from "@/hooks/use-file";
import type { ContentStatus } from "@/lib/constants/content-status";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { canViewUnpublishedContent, ROLE } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-can";
import { useUserId, useUserRole } from "@/lib/rbac/use-user-role";
import type { TocItem } from "@/lib/tiptap/types"; // ✅ Fixed import
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { Editor } from "@tiptap/react";
import { useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { z } from "zod";

const courseSearchSchema = z.object({
  editMode: z.coerce.boolean().default(false),
});

export const Route = createFileRoute("/_authenticated/c/$courseId/")({
  validateSearch: zodValidator(courseSearchSchema),
  component: CourseOverviewPage,
});

function CourseOverviewPage() {
  const { courseId } = Route.useParams();
  const { editMode } = Route.useSearch();
  const navigate = useNavigate();
  const userRole = useUserRole();
  const userId = useUserId();
  const isLearner = userRole === ROLE.LEARNER;

  // ========================================================================
  // State
  // ========================================================================
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]); // ✅ Added TOC

  // ========================================================================
  // Data Fetching
  // ========================================================================
  const course = useQuery(api.faculty.courses.getCourseById, {
    courseId: courseId as Id<"courses">,
  });
  const modules = useQuery(api.faculty.navigation.getModulesWithLessons, {
    courseId: courseId as Id<"courses">,
  });

  const lessonProgress = useQuery(
    api.learner.progress.getLessonProgressByCourse,
    isLearner && userId ? { courseId: courseId as Id<"courses"> } : "skip"
  );

  // ========================================================================
  // Computed Values
  // ========================================================================
  const totalLessons =
    modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = lessonProgress?.filter((p) => p.completed).length || 0;

  const firstModule = modules?.[0];
  const firstLesson = firstModule?.lessons?.[0];
  const firstLessonHref =
    firstModule && firstLesson
      ? `/c/${courseId}/m/${firstModule._id}/lessons/${firstLesson._id}`
      : undefined;

  // ========================================================================
  // Permissions & Editor
  // ========================================================================
  const canView = useCan("view", "course", {
    status: course?.status as ContentStatus | undefined,
  });
  const canEdit = useCan("edit", "course", {
    status: course?.status as ContentStatus | undefined,
  });

  const { url: coverImageUrl } = useFileUrl(course?.coverImageId);

  const editor = useCourseEditor(courseId as Id<"courses">, course?.content);

  // ========================================================================
  // Handlers
  // ========================================================================
  const handleSave = useCallback(async () => {
    const success = await editor.save();
    if (success) {
      navigate({
        to: "/c/$courseId",
        params: { courseId },
        search: { editMode: false },
      });
    }
  }, [editor, navigate, courseId]);

  const handleCancel = useCallback(() => {
    editor.cancel();
    navigate({
      to: "/c/$courseId",
      params: { courseId },
      search: { editMode: false },
    });
  }, [editor, navigate, courseId]);

  // ========================================================================
  // Loading & Error States
  // ========================================================================
  if (course === undefined || modules === undefined) {
    return <LoadingPage message="Loading course..." />;
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Course not found</p>
      </div>
    );
  }

  if (!canView) {
    return <AccessDenied message="This course is not published yet" />;
  }

  // ========================================================================
  // Special Learner View
  // ========================================================================
  if (isLearner && !editMode) {
    return (
      <div className="flex-1 overflow-y-auto">
        <CourseHero
          courseId={courseId as Id<"courses">}
          courseTitle={course.title}
          courseDescription={course.description}
          modules={modules || []}
          firstLessonHref={firstLessonHref}
          totalLessons={totalLessons}
          completedLessons={completedLessons}
          coverImageUrl={coverImageUrl ?? undefined}
          showProgress={true}
          variant="landing"
        />
      </div>
    );
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
    statusConfig[course.status as keyof typeof statusConfig] || statusConfig.draft;
  const showPreviewBanner =
    userRole &&
    canViewUnpublishedContent(userRole) &&
    course.status !== CONTENT_STATUS.PUBLISHED;

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <PreviewLayout
      courseId={courseId as Id<"courses">}
      modules={modules || []}
      contentStatus={course.status}
      contentType="course"
      breadcrumb={{ courseTitle: course.title }}
      isEditMode={editMode && canEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={editor.isSaving}
      tableOfContents={
        tocItems.length > 0 ? (
          <TableOfContents anchors={tocItems} title={course.title} />
        ) : null
      } // ✅ Added TOC
    >
      <ContentHeader
        title={course.title}
        description={course.description}
        statusBadge={
          showPreviewBanner ? (
            <Badge variant={config.variant} className="capitalize">
              {config.label}
            </Badge>
          ) : undefined
        }
        variant="course"
      />
      <div className="container mx-auto max-w-prose px-4 py-8">


        {/* Mobile TOC */}
        {tocItems.length > 0 && (
          <InlineTOC anchors={tocItems} className="mb-6 xl:hidden" />
        )}

        <section className="pt-4">
          {!editMode ? (
            <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none">
              <MarkdownViewer
                markdown={course.content || ""}
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
                config={TOOLBAR_PRESETS.blog} // ✅ Use blog preset
              />
              <MarkdownEditor
                initialMarkdown={course.content || ""}
                onUpdate={editor.setMarkdown}
                onEditorReady={setEditorInstance}
                onTocUpdate={setTocItems} // ✅ Added TOC
                placeholder="Describe your course..."
              />
            </div>
          )}
        </section>

        <section className="pb-4">
          <CourseLearningCard
            modules={modules || []}
            onBeginCourse={(moduleId) =>
              navigate({
                to: "/c/$courseId/m/$moduleId",
                params: { courseId, moduleId },
              })
            }
          />
        </section>
      </div>
    </PreviewLayout>
  );
}