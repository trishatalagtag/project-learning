import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"

interface LessonNavigationProps {
  courseId: Id<"courses">
  previous: {
    lessonId: string
    moduleId: string
    lessonTitle: string
    moduleTitle: string
  } | null
  next: {
    lessonId: string
    moduleId: string
    lessonTitle: string
    moduleTitle: string
  } | null
  currentModuleTitle: string
}

export function LessonNavigation({ courseId, previous, next }: LessonNavigationProps) {
  const navigate = useNavigate()

  const handlePrevious = () => {
    if (previous) {
      navigate({
        to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
        params: {
          courseId,
          moduleId: previous.moduleId as Id<"modules">,
          lessonId: previous.lessonId as Id<"lessons">,
        },
      })
    }
  }

  const handleNext = () => {
    if (next) {
      navigate({
        to: "/c/$courseId/m/$moduleId/lessons/$lessonId",
        params: {
          courseId,
          moduleId: next.moduleId as Id<"modules">,
          lessonId: next.lessonId as Id<"lessons">,
        },
      })
    }
  }

  return (
    <ButtonGroup className="w-full">
      <Button
        variant="outline"
        className={cn(
          "group relative flex-1 justify-start gap-3 px-4 py-3 transition-all",
          "hover:bg-accent/50 hover:border-accent-foreground/20",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
        onClick={handlePrevious}
        disabled={!previous}
        aria-label={
          previous ? `Go to previous lesson: ${previous.lessonTitle}` : "No previous lesson"
        }
      >
        <ChevronLeftIcon
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            "group-hover:-translate-x-0.5 group-disabled:translate-x-0",
            previous ? "text-foreground" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "font-medium truncate text-sm transition-colors",
            previous ? "text-foreground group-hover:text-foreground/90" : "text-muted-foreground",
          )}
        >
          {previous ? previous.lessonTitle : "No previous lesson"}
        </span>
      </Button>

      <ButtonGroupSeparator />

      <Button
        variant="outline"
        className={cn(
          "group relative flex-1 justify-between gap-3 px-4 py-3 transition-all",
          "hover:bg-accent/50 hover:border-accent-foreground/20",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-40",
        )}
        onClick={handleNext}
        disabled={!next}
        aria-label={next ? `Go to next lesson: ${next.lessonTitle}` : "No next lesson"}
      >
        <span
          className={cn(
            "font-medium truncate text-sm transition-colors flex-1 text-left min-w-0",
            next ? "text-foreground group-hover:text-foreground/90" : "text-muted-foreground",
          )}
        >
          {next ? next.lessonTitle : "No next lesson"}
        </span>
        <ChevronRightIcon
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            "group-hover:translate-x-0.5 group-disabled:translate-x-0",
            next ? "text-foreground" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
      </Button>
    </ButtonGroup>
  )
}
