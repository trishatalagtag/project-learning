"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Id } from "@/convex/_generated/dataModel"
import type { ModuleWithLessons } from "@/lib/types/navigation"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"

interface CourseHeroProps {
  courseId: Id<"courses">
  courseTitle: string
  courseDescription?: string
  modules: ModuleWithLessons[]
  firstLessonHref?: string
  totalLessons: number
  completedLessons: number
  showProgress?: boolean
  variant?: "card" | "landing"
  coverImageUrl?: string
}

export function CourseHero({
  courseTitle,
  courseDescription,
  modules,
  firstLessonHref,
  totalLessons,
  completedLessons,
  showProgress = true,
  variant = "card",
  coverImageUrl,
}: CourseHeroProps) {
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (variant === "landing") {
    const hasCover = Boolean(coverImageUrl)

    return (
      <section className="relative isolate overflow-hidden">
        {hasCover ? (
          <>
            <div className="absolute inset-0">
              <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/60" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 [background-size:40px_40px] [background:radial-gradient(closest-side,theme(colors.black/3%)_0,transparent_100%)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)]" />
        )}
        <div
          className={cn(
            "mx-auto max-w-5xl px-6 py-24 text-center",
            hasCover ? "relative text-white" : "",
          )}
        >
          <h1 className="font-bold text-5xl tracking-tight sm:text-6xl">{courseTitle}</h1>
          {courseDescription && (
            <p
              className={cn(
                "mx-auto mt-4 max-w-2xl text-lg text-muted-foreground",
                hasCover ? "text-white/80" : "",
              )}
            >
              {courseDescription}
            </p>
          )}
          <div className="mt-8 flex items-center justify-center gap-3">
            {firstLessonHref && (
              <Link to={firstLessonHref}>
                <Button size="lg">
                  {completedLessons > 0 ? "Continue Learning" : "Begin Course"}
                </Button>
              </Link>
            )}
          </div>
          {showProgress && (
            <div className="mx-auto mt-6 max-w-md">
              <p className={cn("text-muted-foreground text-sm", hasCover ? "text-white/80" : "")}>
                {completedLessons} of {totalLessons} lessons completed ({progressPercent}%)
              </p>
              <Progress value={progressPercent} className="mt-2 h-2" />
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="mb-2 text-3xl">{courseTitle}</CardTitle>
          {courseDescription && (
            <CardDescription className="text-base">{courseDescription}</CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showProgress && (
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">
              {completedLessons} of {totalLessons} lessons completed ({progressPercent}%)
            </p>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {firstLessonHref && (
          <div className="text-center">
            <Link to={firstLessonHref}>
              <Button size="lg" className="w-full sm:w-auto">
                {completedLessons > 0 ? "Continue Learning" : "Begin Course"}
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Course Content</h3>
          <div className="space-y-1">
            {modules.map((module, idx) => (
              <div key={module._id} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">{idx + 1}.</span>
                <div className="min-w-0 flex-1">
                  <span className="truncate">{module.title}</span>
                  {module.lessons && (
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({module.lessons.length} lessons)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
