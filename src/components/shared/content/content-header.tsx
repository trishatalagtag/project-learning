import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ContentHeaderProps {
  title: string
  description?: string
  statusBadge?: ReactNode
  rightActions?: ReactNode
  variant?: "course" | "module" | "lesson"
  className?: string
}

export function ContentHeader({
  title,
  description,
  statusBadge,
  rightActions,
  variant = "lesson",
  className,
}: ContentHeaderProps) {
  const variantClasses = {
    course: {
      container:
        "relative mb-8 flex-col overflow-hidden border-b bg-sidebar px-4 py-12 sm:items-center sm:justify-center sm:px-8 sm:py-16 sm:text-center md:px-16 md:py-24 lg:py-32",
      title:
        "font-semibold text-balance text-center text-3xl leading-tight tracking-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight",
      description:
        "text-pretty text-sm text-muted-foreground mt-2 text-center sm:text-base md:text-lg",
    },
    module: {
      container:
        "relative mb-8 flex-col overflow-hidden border-b bg-sidebar px-4 py-12 sm:items-center sm:justify-center sm:px-8 sm:py-16 sm:text-center md:px-16 md:py-24 lg:py-32",
      title:
        "text-balance text-xl font-bold text-center tracking-tight sm:text-2xl md:text-3xl lg:text-4xl",
      description:
        "text-pretty text-xs text-muted-foreground mt-1.5 text-center sm:text-sm md:text-base",
    },
    lesson: {
      container: "border-b bg-background -mx-6 px-6 py-4 shrink-0",
      title: "text-xl font-semibold leading-tight tracking-tight sm:text-2xl sm:leading-tight",
      description:
        "text-pretty text-sm text-muted-foreground mt-2 leading-normal sm:text-base sm:leading-normal",
    },
  }

  const classes = variantClasses[variant]
  const isCentered = variant === "course" || variant === "module"

  return (
    <header className={`-mx-6 mb-6 ${classes.container} ${className || ""}`}>
      <div
        className={
          isCentered ? "flex flex-col items-center gap-4" : "flex items-start justify-between gap-4"
        }
      >
        <div className={isCentered ? "w-full" : "min-w-0 flex-1"}>
          <h1
            className={cn(
              "text-balance font-medium text-2xl leading-tight tracking-tight sm:text-3xl md:text-5xl",
              classes.title,
            )}
          >
            {title}
          </h1>
          {description && <p className={classes.description}>{description}</p>}
        </div>
        {(statusBadge || rightActions) && (
          <div className="flex shrink-0 items-center gap-3">
            {statusBadge}
            {rightActions}
          </div>
        )}
      </div>
    </header>
  )
}
