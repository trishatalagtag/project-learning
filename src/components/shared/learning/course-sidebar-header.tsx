import { Bars3Icon, ChevronRightIcon } from "@heroicons/react/24/solid";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface CourseSidebarHeaderProps {
    courseTitle: string;
    moduleTitle?: string;
    lessonTitle?: string;
}

export function CourseSidebarHeader({
    courseTitle,
    moduleTitle,
    lessonTitle,
}: CourseSidebarHeaderProps) {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <header className="flex h-15 shrink-0 items-center gap-2 px-4">
            {/* Mobile: Custom drawer trigger */}
            {isMobile ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setOpenMobile(true)}
                >
                    <Bars3Icon className="size-5" />
                    <span className="sr-only">Open course navigation</span>
                </Button>
            ) : (
                // Desktop: Regular sidebar trigger
                <SidebarTrigger className="-ml-1" />
            )}

            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink>{courseTitle}</BreadcrumbLink>
                    </BreadcrumbItem>

                    {moduleTitle && (
                        <>
                            <BreadcrumbSeparator className="hidden md:block">
                                <ChevronRightIcon className="h-3.5 w-3.5" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                {lessonTitle ? (
                                    <BreadcrumbLink>{moduleTitle}</BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{moduleTitle}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </>
                    )}

                    {lessonTitle && (
                        <>
                            <BreadcrumbSeparator>
                                <ChevronRightIcon className="h-3.5 w-3.5" />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{lessonTitle}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}