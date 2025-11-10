"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  Bars3Icon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Drawer } from "vaul"

interface CourseSidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right"
}

export function CourseSidebar({
  side = "left",
  className,
  children,
  ...props
}: CourseSidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile, toggleSidebar } = useSidebar()

  if (isMobile) {
    return (
      <Drawer.Root open={openMobile} onOpenChange={setOpenMobile}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content
            className={cn(
              "fixed right-0 bottom-0 left-0 z-50 flex h-[96%] flex-col rounded-t-[10px] bg-sidebar text-sidebar-foreground",
              "[&>*]:transform-none",
              className,
            )}
            style={{
              backfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            <div className="mx-auto mt-4 mb-2 h-1.5 w-12 flex-shrink-0 rounded-full bg-sidebar-foreground/20" />
            <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  const isCollapsed = state === "collapsed"

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-side={side}
      data-variant="sidebar"
    >
      <div
        className={cn(
          "relative h-svh w-[280px] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[state=collapsed]:w-[64px]",
        )}
      />

      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[280px] transition-[width] duration-200 ease-linear md:flex",
          side === "left" ? "left-0" : "right-0",
          "border-sidebar-border border-r",
          "group-data-[state=collapsed]:w-[64px]",
        )}
      >
        <div
          data-sidebar="sidebar"
          className={cn("flex h-full w-full flex-col overflow-hidden bg-sidebar", className)}
          {...props}
        >
          {isCollapsed ? (
            <div className="flex items-center justify-center py-2.5">
              <button
                type="button"
                onClick={toggleSidebar}
                className="rounded-full p-2 text-sidebar-foreground/70 transition-[background-color,color] duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="size-5" />
              </button>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}

const courseSidebarHeaderVariants = cva(
  "flex shrink-0 items-center border-sidebar-border border-b transition-[padding] duration-200 ease-linear",
  {
    variants: {
      size: {
        default: "px-4 py-2.5",
        sm: "px-3 py-2",
        lg: "px-4 py-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export function CourseSidebarHeader({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof courseSidebarHeaderVariants>) {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div
      className={cn(
        courseSidebarHeaderVariants({ size }),
        !isMobile && isCollapsed ? "justify-center" : "justify-between",
        className,
      )}
      {...props}
    />
  )
}

const courseSidebarTitleVariants = cva(
  "rounded font-semibold text-sidebar-foreground transition-[color] duration-200 ease-linear hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
  {
    variants: {
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export function CourseSidebarTitle({
  className,
  asChild = false,
  size,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean } & VariantProps<
    typeof courseSidebarTitleVariants
  >) {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const Comp = asChild ? Slot : "a"

  if (!isMobile && isCollapsed) return null

  return <Comp className={cn(courseSidebarTitleVariants({ size }), className)} {...props} />
}

export function CourseSidebarClose({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar, isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={cn(
        "rounded-full p-1.5 text-sidebar-foreground/70 transition-[background-color,color] duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className,
      )}
      aria-label={isMobile ? "Close sidebar" : isCollapsed ? "Open sidebar" : "Close sidebar"}
      {...props}
    >
      {!isMobile && isCollapsed ? (
        <Bars3Icon className="size-4" />
      ) : (
        <XMarkIcon className="size-4" />
      )}
    </button>
  )
}

export function CourseSidebarMobileTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { isMobile, setOpenMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <button
      type="button"
      onClick={() => setOpenMobile(true)}
      className={cn(
        "rounded-lg p-2 text-foreground transition-[background-color] duration-200 ease-linear hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden",
        className,
      )}
      aria-label="Open course menu"
      {...props}
    >
      <Bars3Icon className="size-5" />
    </button>
  )
}

export function CourseSidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (isMobile || !isCollapsed) {
    return (
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden",
          !isMobile && "group-data-[state=collapsed]:overflow-hidden",
          className,
        )}
        {...props}
      />
    )
  }

  return null
}

interface CourseModuleContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CourseModuleContext = React.createContext<CourseModuleContextValue | null>(null)

function useCourseModule() {
  const context = React.useContext(CourseModuleContext)
  if (!context) {
    throw new Error("useCourseModule must be used within CourseModule")
  }
  return context
}

export function CourseModule({
  defaultOpen = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  React.useEffect(() => {
    if (!isMobile && isCollapsed) {
      setIsOpen(false)
    }
  }, [isCollapsed, isMobile])

  return (
    <CourseModuleContext.Provider value={{ isOpen, setIsOpen }}>
      <div className={cn("border-sidebar-border border-b last:border-b-0", className)} {...props}>
        {children}
      </div>
    </CourseModuleContext.Provider>
  )
}

const courseModuleHeaderVariants = cva(
  "flex w-full items-center transition-[background-color,padding] duration-200 ease-linear hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset",
  {
    variants: {
      size: {
        default: "py-2.5",
        sm: "py-2",
        lg: "py-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export function CourseModuleHeader({
  className,
  asChild = false,
  size,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean } & VariantProps<
    typeof courseModuleHeaderVariants
  >) {
  const { isOpen, setIsOpen } = useCourseModule()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      type="button"
      aria-expanded={isOpen}
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        courseModuleHeaderVariants({ size }),
        !isMobile && isCollapsed ? "justify-center px-2" : "justify-between px-3.5 text-left",
        className,
      )}
      {...props}
    />
  )
}

export function CourseModuleLabel({ className, children, ...props }: React.ComponentProps<"div">) {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-0.5 transition-[margin,opacity] duration-200 ease-linear",
        !isMobile && isCollapsed && "-ml-2 opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const courseModuleNumberVariants = cva(
  "font-semibold text-sidebar-foreground/60 uppercase tracking-wide",
  {
    variants: {
      size: {
        default: "text-[10px] leading-tight",
        sm: "text-[9px] leading-tight",
        lg: "text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export function CourseModuleNumber({
  className,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof courseModuleNumberVariants>) {
  return <span className={cn(courseModuleNumberVariants({ size }), className)} {...props} />
}

const courseModuleTitleVariants = cva("truncate font-semibold text-sidebar-foreground", {
  variants: {
    size: {
      default: "text-xs",
      sm: "text-[11px] leading-tight",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export function CourseModuleTitle({
  className,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof courseModuleTitleVariants>) {
  return <span className={cn(courseModuleTitleVariants({ size }), className)} {...props} />
}

const courseModuleChevronVariants = cva(
  "shrink-0 text-sidebar-foreground/70 transition-[transform,opacity] duration-200 ease-linear",
  {
    variants: {
      size: {
        default: "size-5",
        sm: "size-4",
        lg: "size-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export function CourseModuleChevron({
  className,
  size,
  ...props
}: React.ComponentProps<"svg"> & VariantProps<typeof courseModuleChevronVariants>) {
  const { isOpen } = useCourseModule()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn(
        courseModuleChevronVariants({ size }),
        isOpen && "rotate-180",
        !isMobile && isCollapsed && "opacity-0",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 12.75a.73.73 0 01-.53-.22L5.53 8.59a.75.75 0 011.06-1.06L10 10.94l3.41-3.41a.75.75 0 011.06 1.06l-3.94 3.94a.73.73 0 01-.53.22z" />
    </svg>
  )
}

const courseModuleIconVariants = cva("shrink-0 transition-[opacity] duration-200 ease-linear", {
  variants: {
    size: {
      default: "size-5",
      sm: "size-4",
      lg: "size-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export function CourseModuleIcon({
  className,
  children,
  size,
}: {
  className?: string
  children?: React.ReactNode
} & VariantProps<typeof courseModuleIconVariants>) {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div
      className={cn(
        courseModuleIconVariants({ size }),
        !isMobile && isCollapsed ? "opacity-100" : "hidden opacity-0",
        className,
      )}
    >
      {children || <DocumentTextIcon className="size-full text-sidebar-foreground/70" />}
    </div>
  )
}

export function CourseModuleContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isOpen } = useCourseModule()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight)
    }
  }, [children, isOpen])

  if (!isMobile && isCollapsed) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "overflow-hidden transition-[max-height,opacity] duration-200 ease-linear",
        className,
      )}
      style={{
        maxHeight: isOpen ? `${maxHeight}px` : "0px",
        opacity: isOpen ? 1 : 0,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function CourseLessonList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("m-0 list-none p-0", className)} {...props} />
}

const courseLessonVariants = cva(
  "flex items-start border-b border-sidebar-border last:border-b-0 transition-[background-color,border-color] duration-200 ease-linear hover:bg-sidebar-accent",
  {
    variants: {
      active: {
        true: "bg-sidebar-primary/10 border-l-3 border-l-sidebar-primary",
        false: "",
      },
      size: {
        default: "gap-2.5 px-3.5 py-2.5 text-xs min-h-[44px]",
        sm: "gap-2 px-3 py-2 text-xs min-h-[40px]",
        lg: "gap-3 px-4 py-3 text-sm min-h-[48px]",
      },
    },
    compoundVariants: [
      {
        active: true,
        size: "default",
        className: "pl-[11px]",
      },
      {
        active: true,
        size: "sm",
        className: "pl-[9px]",
      },
      {
        active: true,
        size: "lg",
        className: "pl-[13px]",
      },
    ],
    defaultVariants: {
      active: false,
      size: "default",
    },
  },
)

export function CourseLesson({
  className,
  asChild = false,
  active = false,
  size,
  onClick,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  active?: boolean
} & VariantProps<typeof courseLessonVariants>) {
  const Comp = asChild ? Slot : "a"
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) {
      setOpenMobile(false)
    }
    onClick?.(e)
  }

  return (
    <li className="list-none">
      <Comp
        className={cn(courseLessonVariants({ active, size }), className)}
        onClick={handleClick}
        {...props}
      />
    </li>
  )
}

const courseLessonIconVariants = cva("mt-0.5 shrink-0", {
  variants: {
    size: {
      default: "size-4",
      sm: "size-3.5",
      lg: "size-5",
    },
    status: {
      completed: "text-sidebar-primary",
      incomplete: "text-sidebar-border",
      overview: "text-sidebar-primary",
      draft: "text-sidebar-foreground/40",
      pending: "text-chart-2",
      approved: "text-chart-3",
      published: "text-sidebar-primary",
    },
  },
  defaultVariants: {
    size: "default",
    status: "incomplete",
  },
})

export function CourseLessonIcon({
  status = "incomplete",
  size,
  className,
  children,
}: {
  status?: "completed" | "incomplete" | "overview" | "draft" | "pending" | "approved" | "published"
  className?: string
  children?: React.ReactNode
} & VariantProps<typeof courseLessonIconVariants>) {
  const iconSize = size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"

  if (status === "completed") {
    return (
      <div className={cn(courseLessonIconVariants({ size, status }), className)}>
        {children || (
          <CheckCircleIcon
            className={cn(iconSize, "transition-[color] duration-200 ease-linear")}
          />
        )}
      </div>
    )
  }

  if (status === "overview") {
    return (
      <div className={cn(courseLessonIconVariants({ size, status }), className)}>
        {children || (
          <div
            className={cn(
              iconSize,
              "flex items-center justify-center rounded-full border-2 border-sidebar-primary transition-[border-color] duration-200 ease-linear",
            )}
          >
            <div
              className={cn(
                "rounded-full bg-sidebar-primary transition-[background-color] duration-200 ease-linear",
                size === "sm" ? "size-1" : size === "lg" ? "size-2.5" : "size-1.5",
              )}
            />
          </div>
        )}
      </div>
    )
  }

  if (status === "draft") {
    return (
      <div className={cn(courseLessonIconVariants({ size, status }), className)}>
        {children || (
          <DocumentTextIcon
            className={cn(iconSize, "transition-[color] duration-200 ease-linear")}
          />
        )}
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className={cn(courseLessonIconVariants({ size, status }), className)}>
        {children || (
          <ClockIcon className={cn(iconSize, "transition-[color] duration-200 ease-linear")} />
        )}
      </div>
    )
  }

  if (status === "approved") {
    return (
      <div className={cn(courseLessonIconVariants({ size, status }), className)}>
        {children || (
          <CheckBadgeIcon className={cn(iconSize, "transition-[color] duration-200 ease-linear")} />
        )}
      </div>
    )
  }

  if (status === "published") {
    return (
      <div className={cn(courseLessonIconVariants({ size, status }), className)}>
        {children || (
          <CheckCircleIcon
            className={cn(iconSize, "transition-[color] duration-200 ease-linear")}
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn(courseLessonIconVariants({ size, status }), className)}>
      {children || (
        <div
          className={cn(
            iconSize,
            "rounded-full border-2 border-sidebar-border transition-[border-color] duration-200 ease-linear",
          )}
        />
      )}
    </div>
  )
}

export function CourseLessonDetails({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)} {...props} />
}

const courseLessonTitleVariants = cva("truncate transition-[color] duration-200 ease-linear", {
  variants: {
    active: {
      true: "font-semibold text-sidebar-primary",
      false: "text-sidebar-foreground",
    },
    size: {
      default: "text-xs",
      sm: "text-[11px] leading-tight",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    active: false,
    size: "default",
  },
})

export function CourseLessonTitle({
  className,
  active = false,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof courseLessonTitleVariants>) {
  return <span className={cn(courseLessonTitleVariants({ active, size }), className)} {...props} />
}

const courseLessonMetaVariants = cva(
  "text-sidebar-foreground/60 transition-[color] duration-200 ease-linear",
  {
    variants: {
      size: {
        default: "text-[10px] leading-tight",
        sm: "text-[9px] leading-tight",
        lg: "text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
)

export function CourseLessonMeta({
  className,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof courseLessonMetaVariants>) {
  return <span className={cn(courseLessonMetaVariants({ size }), className)} {...props} />
}
