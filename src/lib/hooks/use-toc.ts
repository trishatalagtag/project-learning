import { useEffect, useMemo, useState } from "react";

export type TocAnchor = {
  id: string;
  text: string;
  level: number; // 1-6 for h1-h6
};

/**
 * Generate ID from heading text (matches Next.js logic)
 */
function generateIdFromText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extract headings from HTML content and generate TOC anchors
 */
export function useToc(htmlContent: string): TocAnchor[] {
  return useMemo(() => {
    if (!htmlContent) return [];

    // Parse HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Extract all headings (h1-h6)
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

    return Array.from(headings).map((heading) => {
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName[1], 10);
      const id = generateIdFromText(text);

      return {
        id,
        text,
        level,
      };
    });
  }, [htmlContent]);
}

/**
 * Track active heading based on scroll position
 */
export function useActiveTocId(anchorIds: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!anchorIds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px", // Trigger when in upper 20% of viewport
      }
    );

    // Observe all heading elements
    anchorIds.forEach((id) => {
      const element = document.getElementById(id) || document.querySelector(`[data-toc-id="${id}"]`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [anchorIds]);

  return activeId;
}

