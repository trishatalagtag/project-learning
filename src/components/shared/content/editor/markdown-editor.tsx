"use client"

import { type Editor, EditorContent, useEditor } from "@tiptap/react"
import { useEffect, useRef } from "react"

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

import { createTipTapExtensions } from "@/lib/tiptap/extensions"
import { useConvexImageUpload } from "@/lib/tiptap/image-upload-handler"
import type { BaseEditorProps } from "@/lib/tiptap/types"

interface MarkdownEditorProps extends BaseEditorProps {
  initialMarkdown?: string
  markdown?: string
  onUpdate?: (markdown: string) => void
  onEditorReady?: (editor: Editor) => void
  placeholder?: string
  editable?: boolean
  maxCharacters?: number
  enableMath?: boolean
  autofocus?: boolean | "start" | "end"
}

export function MarkdownEditor({
  initialMarkdown = "",
  markdown,
  onUpdate,
  onEditorReady,
  onTocUpdate,
  placeholder = "Start typing...",
  className,
  editorClassName,
  editable = true,
  maxCharacters,
  enableMath = false,
  autofocus = false,
}: MarkdownEditorProps) {
  const uploadHandler = useConvexImageUpload()
  const isControlled = markdown !== undefined
  const onUpdateRef = useRef(onUpdate)
  const onEditorReadyRef = useRef(onEditorReady)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    onEditorReadyRef.current = onEditorReady
  }, [onEditorReady])

  const editor = useEditor({
    extensions: createTipTapExtensions({
      placeholder,
      uploadHandler,
      onTocUpdate,
      enableImageUpload: true,
      maxCharacters,
      enableMath,
    }),
    content: isControlled ? markdown : initialMarkdown,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: editorClassName || "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
        "aria-label": "Markdown editor",
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdateRef.current) {
        // @ts-expect-error - storage type from extension
        const markdown = editor.storage.markdown.getMarkdown()
        onUpdateRef.current(markdown as string)
      }
    },
    onCreate: ({ editor }) => {
      onEditorReadyRef.current?.(editor)
    },
  })

  useEffect(() => {
    if (editor && isControlled && markdown !== undefined) {
      // @ts-expect-error - storage type from extension
      const currentMarkdown = editor.storage.markdown.getMarkdown()

      if (currentMarkdown !== markdown) {
        editor.commands.setContent(markdown)
      }
    }
  }, [editor, markdown, isControlled])

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  if (!editor) {
    return (
      <div className={className}>
        <div className={editorClassName || "prose prose-sm min-h-[400px] max-w-none p-4"}>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
      {maxCharacters && (
        <div className="mt-2 text-right text-muted-foreground text-xs">
          {editor.storage.characterCount.characters()}/{maxCharacters} characters
        </div>
      )}
    </div>
  )
}
