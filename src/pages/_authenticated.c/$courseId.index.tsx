import { AccessDenied } from "@/components/shared/access-denied";
import { CourseHero } from "@/components/shared/content/course-hero";
import { EditModeHeader } from "@/components/shared/content/edit-mode-header";
import { EditorToolbar } from "@/components/shared/content/editor-toolbar";
import { useCourseEditor } from "@/components/shared/content/hooks/use-course-editor";
import { MarkdownEditor } from "@/components/shared/content/markdown-editor";
import { MarkdownViewer } from "@/components/shared/content/markdown-viewer";
import { LoadingPage } from "@/components/shared/loading/loading-page";
import { PreviewBanner } from "@/components/shared/preview/preview-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { Editor } from "@tiptap/react";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import type { ContentStatus } from "@/lib/constants/content-status";
import { CONTENT_STATUS, STATUS_CONFIG } from "@/lib/constants/content-status";
import { useCan } from "@/lib/hooks/use-can";
import { canViewUnpublishedContent, ROLE } from "@/lib/rbac/permissions";
import { useUserId, useUserRole } from "@/lib/rbac/use-user-role";

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
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const course = useQuery(api.faculty.courses.getCourseById, {
    courseId: courseId as Id<"courses">
  });
  const modules = useQuery(
    api.faculty.navigation.getModulesWithLessons,
    { courseId: courseId as Id<"courses"> }
  );

  const lessonProgress = useQuery(
    api.learner.progress.getLessonProgressByCourse,
    isLearner && userId ? { courseId: courseId as Id<"courses"> } : "skip"
  );

  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = lessonProgress?.filter(p => p.completed).length || 0;

  const firstModule = modules?.[0];
  const firstLesson = firstModule?.lessons?.[0];
  const firstLessonHref = firstModule && firstLesson
    ? `/c/${courseId}/m/${firstModule._id}/lessons/${firstLesson._id}`
    : undefined;

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This ensures hooks are called in the same order on every render
  const canView = useCan("view", "course", {
    status: course?.status as ContentStatus | undefined,
  });
  const canEdit = useCan("edit", "course", {
    status: course?.status as ContentStatus | undefined,
  });

  const editor = useCourseEditor(
    courseId as Id<"courses">,
    course?.content
  );

  // STEP 1: Check if data is LOADING first
  if (course === undefined || modules === undefined) {
    return <LoadingPage message="Loading course..." />;
  }

  // STEP 2: Check if data is NOT FOUND
  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Course not found</p>
      </div>
    );
  }

  // STEP 3: Permission denied (now using loaded data)
  if (!canView) {
    return <AccessDenied message="This course is not published yet" />;
  }

  const isPreviewMode =
    userRole &&
    canViewUnpublishedContent(userRole) &&
    course.status !== CONTENT_STATUS.PUBLISHED;

  const handleEdit = () => {
    navigate({
      to: "/c/$courseId",
      params: { courseId },
      search: { editMode: true },
    });
  };

  const handleSave = async () => {
    const success = await editor.save();
    if (success) {
      navigate({
        to: "/c/$courseId",
        params: { courseId },
        search: { editMode: false },
      });
    }
  };

  const handleCancel = () => {
    editor.cancel();
    navigate({
      to: "/c/$courseId",
      params: { courseId },
      search: { editMode: false },
    });
  };

  return (
    <>
      {isPreviewMode && (
        <PreviewBanner status={course.status as ContentStatus} contentType="course" />
      )}

      <div className="border-b bg-background px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 font-bold text-4xl">{course.title}</h1>
            <p className="text-lg text-muted-foreground">{course.description}</p>
          </div>
          {canEdit && !editMode && (
            <Button onClick={handleEdit} variant="outline" size="sm">
              Edit Content
            </Button>
          )}
          {canEdit && editMode && (
            <div className="flex gap-2">
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
          {isLearner && !editMode ? (
            <div className="mx-auto max-w-3xl">
              <CourseHero
                courseId={courseId as Id<"courses">}
                courseTitle={course.title}
                courseDescription={course.description}
                modules={modules || []}
                firstLessonHref={firstLessonHref}
                totalLessons={totalLessons}
                completedLessons={completedLessons}
                showProgress={true}
              />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="modules">Modules ({modules?.length ?? 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {!editMode ? (
                  <div className="mx-auto max-w-prose pb-[30vh]">
                    <MarkdownViewer markdown={course.content || ""} />
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
                        initialMarkdown={course.content || ""}
                        onUpdate={editor.setMarkdown}
                        onEditorReady={setEditorInstance}
                        placeholder="Describe your course..."
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="modules">
                <div className="space-y-4">
                  {modules?.map((module) => (
                    <Link
                      key={module._id}
                      to="/c/$courseId/m/$moduleId"
                      params={{ courseId, moduleId: module._id }}
                      className="block rounded-lg border p-6 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2 font-semibold text-xl">{module.title}</h3>
                          <p className="mb-4 text-muted-foreground text-sm">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <span>{module.lessonCount} lessons</span>
                          </div>
                        </div>
                        {isPreviewMode && module.status !== CONTENT_STATUS.PUBLISHED && (
                          <Badge variant={STATUS_CONFIG[module.status as ContentStatus].variant}>
                            {STATUS_CONFIG[module.status as ContentStatus].label}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="modules">
                <div className="space-y-4">
                  {modules?.map((module) => (
                    <Link
                      key={module._id}
                      to="/c/$courseId/m/$moduleId"
                      params={{ courseId, moduleId: module._id }}
                      className="block rounded-lg border p-6 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2 font-semibold text-xl">{module.title}</h3>
                          <p className="mb-4 text-muted-foreground text-sm">
                            {module.description}
                          </p>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <span>{module.lessonCount} lessons</span>
                          </div>
                        </div>
                        {isPreviewMode && module.status !== CONTENT_STATUS.PUBLISHED && (
                          <Badge variant={STATUS_CONFIG[module.status as ContentStatus].variant}>
                            {STATUS_CONFIG[module.status as ContentStatus].label}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
