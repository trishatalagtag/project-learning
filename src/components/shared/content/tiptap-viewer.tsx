"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface TiptapViewerProps {
  content: string;
  className?: string;
  enableToc?: boolean; // NEW
}

export function TiptapViewer({ content, className, enableToc = false }: TiptapViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  // NEW: Inject IDs into headings for TOC anchors
  useEffect(() => {
    if (!editor || !enableToc) return;

    const editorElement = editor.view.dom;
    const headings = editorElement.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach((heading) => {
      const text = heading.textContent || "";
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      heading.id = id;
      heading.setAttribute("data-toc-id", id); // Fallback selector
    });
  }, [editor, content, enableToc]);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}

