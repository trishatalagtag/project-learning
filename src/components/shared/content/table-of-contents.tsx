"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";

import type { TocAnchor } from "@/lib/hooks/use-toc";

interface TableOfContentsProps {
    anchors: TocAnchor[];
    activeId?: string | null;
}

export function TableOfContents({ anchors, activeId }: TableOfContentsProps) {
    if (!anchors || anchors.length === 0) {
        return (
            <div className="space-y-2">
                <p className="font-semibold text-sm">On this page</p>
                <p className="text-sm text-muted-foreground">No headings found</p>
            </div>
        );
    }

    const handleClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();

        const element = document.getElementById(id) || document.querySelector(`[data-toc-id="${id}"]`);

        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="space-y-2">
            <p className="font-semibold text-sm">On this page</p>
            <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-2">
                    {anchors.map((anchor) => (
                        <a
                            key={anchor.id}
                            href={`#${anchor.id}`}
                            onClick={(e) => handleClick(e, anchor.id)}
                            className={cn(
                                "block text-sm transition-colors hover:text-foreground",
                                activeId === anchor.id
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground",
                                anchor.level === 2 && "pl-0",
                                anchor.level === 3 && "pl-4",
                                anchor.level === 4 && "pl-8",
                                anchor.level === 5 && "pl-12",
                                anchor.level === 6 && "pl-16"
                            )}
                        >
                            {anchor.text}
                        </a>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

