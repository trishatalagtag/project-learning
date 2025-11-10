"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
    CheckBadgeIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Drawer } from "vaul";

/* ============================================================================
 * COURSE SIDEBAR CONTAINER
 * ========================================================================== */

interface CourseSidebarProps extends React.ComponentProps<"div"> {
    side?: "left" | "right";
}

export function CourseSidebar({
    side = "left",
    className,
    children,
    ...props
}: CourseSidebarProps) {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    // Mobile: Use Vaul Drawer
    if (isMobile) {
        return (
            <Drawer.Root open={openMobile} onOpenChange={setOpenMobile}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
         // In CourseSidebar component, replace the mobile Drawer.Content:

                    <Drawer.Content
                        className={cn(
                            "bg-sidebar text-sidebar-foreground fixed bottom-0 left-0 right-0 flex h-[96%] flex-col rounded-t-[10px] z-50",
                            "[&>*]:transform-none",
                            className
                        )}
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitFontSmoothing: 'antialiased',
                        }}
                    >
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-sidebar-foreground/20 mt-4 mb-2" />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {children}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        );
    }

    // Desktop: Fixed sidebar
    return (
        <div
            className="group peer text-sidebar-foreground hidden md:block"
            data-state={state}
            data-side={side}
            data-variant="sidebar"
        >
            {/* Sidebar gap (spacer) */}
            <div
                className={cn(
                    "relative h-svh w-[280px] bg-transparent transition-[width] duration-200 ease-linear",
                    "group-data-[state=collapsed]:w-0"
                )}
            />

            {/* Fixed sidebar container */}
            <div
                className={cn(
                    "fixed inset-y-0 z-10 hidden h-svh w-[280px] transition-[left,right,width] duration-200 ease-linear md:flex",
                    side === "left"
                        ? "left-0 group-data-[state=collapsed]:left-[-280px]"
                        : "right-0 group-data-[state=collapsed]:right-[-280px]",
                    "border-r border-sidebar-border"
                )}
            >
                <div
                    data-sidebar="sidebar"
                    className={cn(
                        "bg-sidebar flex h-full w-full flex-col",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ============================================================================
 * COURSE SIDEBAR HEADER
 * ========================================================================== */

export function CourseSidebarHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "flex items-center justify-between border-b border-sidebar-border px-4 py-3 shrink-0",
                className
            )}
            {...props}
        />
    );
}

export function CourseSidebarTitle({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "a";

    return (
        <Comp
            className={cn(
                "text-base font-bold text-sidebar-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded",
                className
            )}
            {...props}
        />
    );
}

export function CourseSidebarClose({
    className,
    ...props
}: React.ComponentProps<"button">) {
    const { toggleSidebar } = useSidebar();

    return (
        <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
                "rounded-full p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring transition-colors",
                className
            )}
            aria-label="Toggle sidebar"
            {...props}
        />
    );
}

/* ============================================================================
 * COURSE SIDEBAR CONTENT (Scrollable)
 * ========================================================================== */

export function CourseSidebarContent({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    );
}

/* ============================================================================
 * COURSE MODULE (Accordion Item)
 * ========================================================================== */

interface CourseModuleContextValue {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const CourseModuleContext = React.createContext<CourseModuleContextValue | null>(
    null
);

function useCourseModule() {
    const context = React.useContext(CourseModuleContext);
    if (!context) {
        throw new Error("useCourseModule must be used within CourseModule");
    }
    return context;
}

export function CourseModule({
    defaultOpen = false,
    className,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <CourseModuleContext.Provider value={{ isOpen, setIsOpen }}>
            <div
                className={cn(
                    "border-b border-sidebar-border last:border-b-0",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </CourseModuleContext.Provider>
    );
}

/* ============================================================================
 * COURSE MODULE HEADER
 * ========================================================================== */

export function CourseModuleHeader({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
    const { isOpen, setIsOpen } = useCourseModule();
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            type="button"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring",
                className
            )}
            {...props}
        />
    );
}

export function CourseModuleLabel({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-1 min-w-0 flex-1", className)} {...props}>
            {children}
        </div>
    );
}

export function CourseModuleNumber({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            className={cn(
                "text-xs font-bold uppercase tracking-wide text-sidebar-foreground/60",
                className
            )}
            {...props}
        />
    );
}

export function CourseModuleTitle({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            className={cn("text-sm font-bold text-sidebar-foreground truncate", className)}
            {...props}
        />
    );
}

export function CourseModuleChevron({
    className,
    ...props
}: React.ComponentProps<"svg">) {
    const { isOpen } = useCourseModule();

    return (
        <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
                "size-6 shrink-0 text-sidebar-foreground/70 transition-transform duration-300",
                isOpen && "rotate-180",
                className
            )}
            aria-hidden="true"
            {...props}
        >
            <path d="M10 12.75a.73.73 0 01-.53-.22L5.53 8.59a.75.75 0 011.06-1.06L10 10.94l3.41-3.41a.75.75 0 011.06 1.06l-3.94 3.94a.73.73 0 01-.53.22z" />
        </svg>
    );
}

/* ============================================================================
 * COURSE MODULE CONTENT (Collapsible)
 * ========================================================================== */

export function CourseModuleContent({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    const { isOpen } = useCourseModule();
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = React.useState<number | undefined>(undefined);

    React.useEffect(() => {
        if (contentRef.current) {
            setMaxHeight(contentRef.current.scrollHeight);
        }
    }, [children, isOpen]);

    return (
        <div
            ref={contentRef}
            className={cn(
                "overflow-hidden transition-[max-height] duration-300 ease-in-out",
                className
            )}
            style={{
                maxHeight: isOpen ? `${maxHeight}px` : "0px",
            }}
            {...props}
        >
            {children}
        </div>
    );
}

/* ============================================================================
 * COURSE LESSON LIST
 * ========================================================================== */

export function CourseLessonList({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            className={cn("list-none p-0 m-0", className)}
            {...props}
        />
    );
}

/* ============================================================================
 * COURSE LESSON ITEM
 * ========================================================================== */

const courseLessonVariants = cva(
    "flex items-start gap-3 px-4 py-3 border-b border-sidebar-border last:border-b-0 text-sm transition-colors hover:bg-sidebar-accent min-h-[48px]",
    {
        variants: {
            active: {
                true: "bg-blue-50 dark:bg-blue-950/30 border-l-3 border-l-blue-600 pl-[13px]",
                false: "",
            },
        },
        defaultVariants: {
            active: false,
        },
    }
);

export function CourseLesson({
    className,
    asChild = false,
    active = false,
    ...props
}: React.ComponentProps<"a"> & {
    asChild?: boolean;
    active?: boolean;
} & VariantProps<typeof courseLessonVariants>) {
    const Comp = asChild ? Slot : "a";

    return (
        <li className="list-none">
            <Comp
                className={cn(courseLessonVariants({ active }), className)}
                {...props}
            />
        </li>
    );
}

/* ============================================================================
 * COURSE LESSON ICON
 * ========================================================================== */

export function CourseLessonIcon({
    status = "incomplete",
    className,
    children,
}: {
    status?: "completed" | "incomplete" | "overview" | "draft" | "pending" | "approved" | "published";
    className?: string;
    children?: React.ReactNode;
}) {
    // Learner completion status
    if (status === "completed") {
        return (
            <div className={cn("shrink-0 mt-0.5", className)}>
                {children || (
                    <CheckCircleIcon className="size-5 text-primary" />
                )}
            </div>
        );
    }

    if (status === "overview") {
        return (
            <div className={cn("shrink-0 mt-0.5", className)}>
                {children || (
                    <div className="size-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="size-2 rounded-full bg-primary" />
                    </div>
                )}
            </div>
        );
    }

    // Faculty/Admin status-based icons
    if (status === "draft") {
        return (
            <div className={cn("shrink-0 mt-0.5", className)}>
                {children || (
                    <DocumentTextIcon className="size-5 text-muted-foreground" />
                )}
            </div>
        );
    }

    if (status === "pending") {
        return (
            <div className={cn("shrink-0 mt-0.5", className)}>
                {children || (
                    <ClockIcon className="size-5 text-chart-2" />
                )}
            </div>
        );
    }

    if (status === "approved") {
        return (
            <div className={cn("shrink-0 mt-0.5", className)}>
                {children || (
                    <CheckBadgeIcon className="size-5 text-chart-3" />
                )}
            </div>
        );
    }

    if (status === "published") {
        return (
            <div className={cn("shrink-0 mt-0.5", className)}>
                {children || (
                    <CheckCircleIcon className="size-5 text-primary" />
                )}
            </div>
        );
    }

    // Incomplete (learner default)
    return (
        <div className={cn("shrink-0 mt-0.5", className)}>
            {children || (
                <div className="size-5 rounded-full border-2 border-border" />
            )}
        </div>
    );
}

/* ============================================================================
 * COURSE LESSON DETAILS
 * ========================================================================== */

export function CourseLessonDetails({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-col gap-0.5 flex-1 min-w-0", className)}
            {...props}
        />
    );
}

export function CourseLessonTitle({
    className,
    active = false,
    ...props
}: React.ComponentProps<"span"> & { active?: boolean }) {
    return (
        <span
            className={cn(
                "text-sm truncate",
                active
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-sidebar-foreground",
                className
            )}
            {...props}
        />
    );
}

export function CourseLessonMeta({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            className={cn("text-xs text-sidebar-foreground/60", className)}
            {...props}
        />
    );
}