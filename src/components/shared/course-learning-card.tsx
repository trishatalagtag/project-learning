"use client"

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import type { FunctionReturnType } from "convex/server"
import { ArrowRight } from "lucide-react"

type ModuleWithLessons = FunctionReturnType<typeof api.shared.content.getModulesWithLessons>[number]

interface CourseLearningCardProps {
  headerTitle?: string
  headerSubtitle?: string
  modules: ModuleWithLessons[]
  onBeginCourse?: (moduleId: Id<"modules">) => void
}

export function CourseLearningCard({
  headerTitle = "Start Your Learning Journey",
  headerSubtitle = "Begin with the first lesson to start this course",
  modules,
  onBeginCourse,
}: CourseLearningCardProps) {
  return (
    <div className="mx-auto w-full overflow-hidden rounded-lg border border-border">
      <div className="bg-secondary p-4">
        <h2 className="font-semibold text-base">{headerTitle}</h2>
        <p className="mt-1 text-secondary-foreground text-sm">{headerSubtitle}</p>
      </div>

      {modules.map((module, index) => {
        const percentComplete =
          module.lessonCount > 0 ? Math.round((0 / module.lessonCount) * 100) : 0

        return (
          <div
            key={module._id}
            className={cn(
              "flex items-center justify-between bg-card p-6",
              index < modules.length - 1 && "border-border border-b",
            )}
          >
            <div className="flex items-center gap-4">
              {/* Step Badge */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                {index + 1}
              </div>

              {/* Module Info */}
              <div>
                <h3 className="font-semibold text-base text-foreground">{module.title}</h3>
                <p className="text-muted-foreground text-sm">
                  0 of {module.lessonCount} lessons completed ({percentComplete}%)
                </p>
              </div>
            </div>

            {/* Begin Course Button */}
            <Button
              className="flex-shrink-0 gap-2 bg-primary text-white"
              onClick={() => onBeginCourse?.(module._id)}
            >
              Begin Course
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
