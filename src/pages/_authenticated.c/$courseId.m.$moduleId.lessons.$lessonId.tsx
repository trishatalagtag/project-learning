import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { AccessDenied } from "@/components/shared/access-denied";
import { useLessonEditor } from "@/components/shared/content/hooks/use-lesson-editor";
import { LessonViewer } from "@/components/shared/content/lesson-viewer";
import { TiptapEditor } from "@/components/shared/content/tiptap-editor";
import { EmptyContent } from "@/components/shared/empty/empty-content";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { useCourseNavigation } from "@/components/shared/preview/hooks/use-course-navigation";
import { PreviewLayout } from "@/components/shared/preview/preview-layout";
import { Button } from "@/components/ui/button";

import { useCan } from "@/lib/hooks/use-can";
import { createIdParam } from "@/lib/hooks/use-route-params";

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

  const lesson = useQuery(api.faculty.lessons.getLessonById, {
    lessonId: lessonId as Id<"lessons">,
  });

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const canView = useCan("view", "lesson", { status: lesson?.status });
  const canEdit = useCan("edit", "lesson", { status: lesson?.status });

  const { modules } = useCourseNavigation(lessonId as Id<"lessons">);

  const editor = useLessonEditor(
    lessonId as Id<"lessons">,
    moduleId as Id<"modules">,
    courseId as Id<"courses">,
    lesson?.content
  );

  // STEP 1: Check loading FIRST
  if (lesson === undefined || modules === undefined) {
    return <LoadingPage message="Loading lesson..." />;
  }

  // STEP 2: Check not found
  if (!lesson) {
    return <EmptyContent type="lesson" />;
  }

  // STEP 3: Permission check (now using loaded data)
  if (!canView) {
    return <AccessDenied message="This lesson is not published yet" />;
  }

  return (
    <PreviewLayout
      courseId={courseId as Id<"courses">}
      courseTitle={lesson.courseName}
      modules={modules}
      currentLessonId={lessonId as Id<"lessons">}
      currentModuleId={moduleId as Id<"modules">}
      contentTitle={lesson.title}
      contentStatus={lesson.status}
      contentType="lesson"
      contentHtml={!editMode ? lesson.content || "" : undefined}
      showToc={!editMode}
      breadcrumb={{
        courseTitle: lesson.courseName,
        moduleTitle: lesson.moduleName,
        lessonTitle: lesson.title,
      }}
      isEditMode={editMode && canEdit}
      onSave={editor.save}
      onCancel={editor.cancel}
      isSaving={editor.isSaving}
    >
      {editMode && canEdit ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            {editor.isSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            {!editor.isSaving && editor.lastSaved && (
              <span className="text-xs text-muted-foreground">
                Saved {formatDistanceToNow(editor.lastSaved, { addSuffix: true })}
              </span>
            )}
            <Button
              onClick={editor.save}
              disabled={!editor.isDirty || editor.isSaving}
              size="sm"
            >
              Save Now
            </Button>
          </div>
          <TiptapEditor
            content={editor.content}
            onChange={editor.setContent}
            disabled={editor.isSaving}
          />
        </>
      ) : (
        <div className="max-w-prose mx-auto pb-[30vh]">
          <LessonViewer lessonId={lessonId as Id<"lessons">} />
        </div>
      )}
    </PreviewLayout>
  );
}
