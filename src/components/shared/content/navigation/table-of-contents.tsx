"use client"

import type { TocAnchor } from "@/lib/tiptap/extensions"
import { cn } from "@/lib/utils"
import { DocumentTextIcon } from "@heroicons/react/24/solid"
import { useEffect, useRef } from "react"

interface TableOfContentsProps {
  anchors: TocAnchor[]
  onAnchorClick?: (id: string) => void
  title?: string
}

export function TableOfContents({ anchors, onAnchorClick, title }: TableOfContentsProps) {
  const tocContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tocContainerRef.current) return

    // Find the active anchor element
    const activeAnchor = tocContainerRef.current.querySelector('[data-active="true"]')
    if (!activeAnchor) return

    // Get the sidebar scroll container
    const sidebarContainer = tocContainerRef.current.closest(".overflow-y-auto") as HTMLElement
    if (!sidebarContainer) return

    // Check if active item is visible in the sidebar viewport
    const containerRect = sidebarContainer.getBoundingClientRect()
    const activeRect = activeAnchor.getBoundingClientRect()

    const isAboveViewport = activeRect.top < containerRect.top + 60
    const isBelowViewport = activeRect.bottom > containerRect.bottom - 60

    // Auto-scroll if needed
    if (isAboveViewport || isBelowViewport) {
      ; (activeAnchor as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      })
    }
  }, [anchors])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    onAnchorClick?.(id)

    // Find the content scroll container
    const scrollContainer = document.querySelector(".overflow-y-auto") as HTMLElement
    const targetElement = document.getElementById(id)

    if (!targetElement || !scrollContainer) return

    // Calculate scroll position with offset
    const targetTop = targetElement.offsetTop
    const offset = 80

    scrollContainer.scrollTo({
      top: targetTop - offset,
      behavior: "smooth",
    })

    // Update URL hash
    window.history.replaceState({}, "", `#${id}`)
  }

  return (
    <div ref={tocContainerRef} className="space-y-3">
      {title && (
        <div className="flex items-center gap-2 border-b pb-3">
          <DocumentTextIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="truncate font-semibold text-base text-foreground">{title}</h3>
        </div>
      )}
      <h2 className="border-b pb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
        On this page
      </h2>
      {!anchors || anchors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No headings found</p>
      ) : (
        <nav className="space-y-0.5" aria-label="Table of contents">
          {anchors.map((anchor) => (
            <a
              key={anchor.uniqueKey}
              href={`#${anchor.id}`}
              onClick={(e) => handleClick(e, anchor.id)}
              data-active={anchor.isActive ? "true" : "false"}
              className={cn(
                "block border-l-[3px] py-1 text-sm transition-all duration-200",
                anchor.isActive
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground",
                anchor.level === 1 && "pl-4",
                anchor.level === 2 && "pl-4",
                anchor.level === 3 && "pl-8",
                anchor.level >= 4 && "pl-12",
              )}
              title={anchor.textContent}
            >
              <span className="block truncate">{anchor.textContent}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
