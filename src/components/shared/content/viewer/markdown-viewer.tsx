"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { useEffect, useRef } from "react"

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

import { createTipTapExtensions } from "@/lib/tiptap/extensions"
import type { BaseEditorProps } from "@/lib/tiptap/types"

interface MarkdownViewerProps extends BaseEditorProps {
  markdown: string
  enableMath?: boolean
}

export function MarkdownViewer({
  markdown,
  onTocUpdate,
  className,
  editorClassName,
  enableMath = false,
}: MarkdownViewerProps) {
  const initialMarkdownRef = useRef(markdown)

  const editor = useEditor({
    extensions: createTipTapExtensions({
      placeholder: "",
      onTocUpdate,
      enableImageUpload: false,
      enableMath,
    }),
    content: initialMarkdownRef.current,
    editable: false,
    editorProps: {
      attributes: {
        class: editorClassName || "prose prose-sm max-w-none focus:outline-none",
        role: "article",
        "aria-label": "Document viewer",
      },
    },
  })

  // Update content when markdown changes
  useEffect(() => {
    if (editor && markdown !== undefined) {
      // @ts-expect-error - storage type from extension
      const currentMarkdown = editor.storage.markdown.getMarkdown()

      if (currentMarkdown !== markdown) {
        editor.commands.setContent(markdown)
      }
    }
  }, [editor, markdown])

  // Cleanup
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  if (!editor) {
    return (
      <div className={className}>
        <div className={editorClassName || "prose prose-sm max-w-none"}>
          <p className="animate-pulse text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  )
}
