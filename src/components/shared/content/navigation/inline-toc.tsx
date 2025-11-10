"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { TocAnchor } from "@/lib/tiptap/extensions"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

interface InlineTOCProps {
  anchors: TocAnchor[]
  className?: string
}

export function InlineTOC({ anchors, className }: InlineTOCProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!anchors || anchors.length === 0) {
    return null
  }

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()

    // Find the scroll container
    const scrollContainer = document.querySelector(".overflow-y-auto") as HTMLElement
    const targetElement = document.getElementById(id)

    if (!targetElement || !scrollContainer) return

    // Scroll to heading
    const offsetTop = targetElement.offsetTop - 80
    scrollContainer.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    })

    // Update URL hash
    window.history.replaceState({}, "", `#${id}`)

    // Auto-close after 1 second
    setTimeout(() => {
      setIsOpen(false)
    }, 1000)
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
    >
      <CollapsibleTrigger className="group inline-flex w-full items-center justify-between px-4 py-2.5 font-medium text-sm transition-colors hover:bg-muted/50">
        Table of Contents
        <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="flex flex-col border-t px-4 py-2 text-sm">
          {anchors.map((anchor) => (
            <a
              key={anchor.uniqueKey}
              href={`#${anchor.id}`}
              onClick={(e) => handleItemClick(e, anchor.id)}
              className={cn(
                "border-l-2 py-1.5 transition-colors hover:border-primary hover:text-foreground",
                anchor.isActive
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
              style={{
                paddingLeft: `${12 * Math.max(anchor.level - 1, 0)}px`,
              }}
            >
              {anchor.textContent}
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
