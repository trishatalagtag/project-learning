import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import { Link, useRouterState } from "@tanstack/react-router"
import * as React from "react"

const DEFAULT_BREADCRUMB_LABELS: Record<string, string> = {
    "/_authenticated/c": "Learner",
    "/_authenticated/c/courses": "My Courses",
    "/_authenticated/c/progress": "My Progress",
    "/_authenticated/c/submissions": "My Submissions",
}

function formatRouteTitle(path: string): string {
    const parts = path
        .replace(/^\/+|\/+$/g, "")
        .split("/")
        .filter(Boolean)
    return parts
        .map((part) => part.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))
        .join(" ")
}

function getBreadcrumbLabel(match: {
    routeId: string
    pathname: string
    context?: unknown
}): string {
    const context = match.context as { breadcrumb?: string } | undefined
    if (context?.breadcrumb) {
        return context.breadcrumb
    }

    if (DEFAULT_BREADCRUMB_LABELS[match.routeId]) {
        return DEFAULT_BREADCRUMB_LABELS[match.routeId]
    }

    const segments = match.pathname.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    if (lastSegment) {
        return formatRouteTitle(lastSegment)
    }

    return "Learner"
}

export function LearnerBreadcrumbHeader() {
    const matches = useRouterState({
        select: (state) => state.matches,
    })

    const breadcrumbMatches = matches.filter((match) => {
        const routeId = match.routeId
        return (
            routeId !== "__root__" &&
            routeId !== "/_authenticated" &&
            routeId !== "/_public" &&
            match.pathname !== "/"
        )
    })

    const breadcrumbs = breadcrumbMatches.map((match, index) => {
        const isLast = index === breadcrumbMatches.length - 1
        const pathname = match.pathname
        const title = getBreadcrumbLabel(match)

        return {
            title,
            pathname,
            isLast,
        }
    })

    if (breadcrumbs.length === 0) {
        return (
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Learner</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
        )
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.pathname}>
                            {index > 0 && (
                                <BreadcrumbSeparator>
                                    <ChevronRightIcon className="h-3.5 w-3.5" />
                                </BreadcrumbSeparator>
                            )}
                            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                                {crumb.isLast ? (
                                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={crumb.pathname}>{crumb.title}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    )
}
