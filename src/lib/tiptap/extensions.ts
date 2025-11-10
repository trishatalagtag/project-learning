"use client"

import type { Extensions } from "@tiptap/core"
import { mergeAttributes } from "@tiptap/core"
import CharacterCount from "@tiptap/extension-character-count"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { Table } from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableOfContents from "@tiptap/extension-table-of-contents"
import TableRow from "@tiptap/extension-table-row"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import TextAlign from "@tiptap/extension-text-align"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"

import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import type { TipTapExtensionOptions, TocItem, TocUpdateCallback } from "./types"

// Re-export types
export type { TocItem, TocUpdateCallback }

// ============================================================================
// Extension Factory
// ============================================================================

export function createTipTapExtensions({
  placeholder = "Start typing...",
  uploadHandler,
  onTocUpdate,
  enableImageUpload = true,
  maxCharacters,
  enableMath = false,
  enableTables = true,
  enableTaskLists = true,
  scrollContainerSelector = ".preview-scroll-container",
  headingLevels = [1, 2, 3, 4, 5, 6],
  textAlignTypes = ["heading", "paragraph"],
  maxImageSize = 5 * 1024 * 1024, // 5MB
}: TipTapExtensionOptions = {}): Extensions {
  const extensions: Extensions = [
    // ========================================================================
    // Core Extensions
    // ========================================================================
    StarterKit.configure({
      horizontalRule: false, // Using custom extension
      heading: false, // Using custom extension with TOC support
      codeBlock: {
        HTMLAttributes: {
          class: "code-block",
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: "blockquote",
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: "list-disc",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "list-decimal",
        },
      },
    }),

    // ========================================================================
    // Markdown Support
    // ========================================================================
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),

    // ========================================================================
    // Custom Nodes
    // ========================================================================
    HorizontalRule,

    // Headings with TOC support
    Heading.extend({
      renderHTML({ node, HTMLAttributes }) {
        const hasLevel = this.options.levels.includes(node.attrs.level)
        const level = hasLevel ? node.attrs.level : this.options.levels[0]

        // Generate clean ID from text content
        const id = node.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")

        return [
          `h${level}`,
          mergeAttributes(this.options.HTMLAttributes, { id, "data-toc-id": id }, HTMLAttributes),
          0,
        ]
      },
    }).configure({
      levels: headingLevels as unknown as Array<1 | 2 | 3 | 4 | 5 | 6>,
    }),

    // ========================================================================
    // Text Formatting
    // ========================================================================
    Underline,
    Highlight.configure({
      multicolor: true,
    }),
    Subscript,
    Superscript,
    Typography,

    // ========================================================================
    // Alignment
    // ========================================================================
    TextAlign.configure({
      types: textAlignTypes,
      alignments: ["left", "center", "right", "justify"],
    }),

    // ========================================================================
    // Links
    // ========================================================================
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),

    // ========================================================================
    // Images
    // ========================================================================
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full h-auto",
      },
      allowBase64: true,
    }),

    // ========================================================================
    // Placeholder
    // ========================================================================
    Placeholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty",
    }),

    // ========================================================================
    // Table of Contents
    // ========================================================================
    TableOfContents.configure({
      scrollParent: () => {
        if (typeof window === "undefined" || typeof document === "undefined") {
          return undefined as unknown as Window
        }

        return document.querySelector<HTMLElement>(scrollContainerSelector) ?? window
      },
      onUpdate: (anchors) => {
        if (!onTocUpdate) return

        const convertedAnchors: TocItem[] = anchors.map((anchor) => ({
          id: anchor.id,
          textContent: anchor.textContent,
          level: anchor.level,
          itemIndex: anchor.itemIndex,
          isActive: anchor.isActive,
          isScrolledOver: anchor.isScrolledOver,
        }))

        onTocUpdate(convertedAnchors)
      },
    }),
  ]

  // ==========================================================================
  // Optional: Task Lists
  // ==========================================================================
  if (enableTaskLists) {
    extensions.push(
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list not-prose",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
    )
  }

  // ==========================================================================
  // Optional: Tables
  // ==========================================================================
  if (enableTables) {
    extensions.push(
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border px-4 py-2 text-left font-bold bg-muted",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border px-4 py-2",
        },
      }),
    )
  }

  // ==========================================================================
  // Optional: Character Count
  // ==========================================================================
  if (maxCharacters !== undefined) {
    extensions.push(
      CharacterCount.configure({
        limit: maxCharacters,
      }),
    )
  }

  // ==========================================================================
  // Optional: Mathematics (LaTeX)
  // ==========================================================================
  if (enableMath) {
    console.warn(
      "Math support is enabled but Mathematics extension is not configured. " +
        "Please install @tiptap-pro/extension-mathematics and uncomment the code.",
    )
  }

  // ==========================================================================
  // Optional: Image Upload
  // ==========================================================================
  if (enableImageUpload && uploadHandler) {
    extensions.push(
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: maxImageSize,
        upload: uploadHandler,
        onError: (error: unknown) => {
          console.error("Image upload failed:", error)
        },
      }),
    )
  }

  return extensions
}

// ============================================================================
// Helper: Get Editor Statistics
// ============================================================================

export function getEditorStats(editor: any) {
  if (!editor) return null

  return {
    characters: editor.storage.characterCount?.characters?.() ?? 0,
    words: editor.storage.characterCount?.words?.() ?? 0,
    limit: editor.storage.characterCount?.limit ?? null,
    percentage: editor.storage.characterCount?.limit
      ? Math.round(
          (editor.storage.characterCount.characters() / editor.storage.characterCount.limit) * 100,
        )
      : null,
  }
}

// ============================================================================
// Helper: Generate TOC from Markdown
// ============================================================================

export function generateTocFromMarkdown(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const anchors: TocItem[] = []
  let index = 0

  let matchResult = headingRegex.exec(markdown)
  while (matchResult !== null) {
    const level = matchResult[1].length
    const textContent = matchResult[2].trim()
    const id = textContent
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    anchors.push({
      id,
      textContent,
      level,
      itemIndex: index,
      isActive: false,
      isScrolledOver: false,
    })

    index++
    matchResult = headingRegex.exec(markdown)
  }

  return anchors
}
