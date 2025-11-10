"use client";

import { mergeAttributes } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

import { useConvexImageUpload } from "@/lib/tiptap/image-upload-handler";

interface MarkdownEditorProps {
    initialMarkdown?: string;
    onUpdate?: (markdown: string) => void;
    onEditorReady?: (editor: Editor) => void;
    placeholder?: string;
    className?: string;
}

const createExtensions = (placeholder: string, uploadHandler: (file: File) => Promise<string>) => [
    StarterKit.configure({
        horizontalRule: false,
        heading: false,
    }),
    Heading.extend({
        renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
            const hasLevel = this.options.levels.includes(node.attrs.level);
            const level = hasLevel ? node.attrs.level : this.options.levels[0];

            const id = node.textContent
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            return [
                `h${level}`,
                mergeAttributes(this.options.HTMLAttributes, { id, "data-toc-id": id }, HTMLAttributes),
                0,
            ];
        },
    }),
    HorizontalRule,
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: "text-primary underline underline-offset-4",
        },
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Image,
    Typography,
    Superscript,
    Subscript,
    Underline,
    ImageUploadNode.configure({
        accept: "image/*",
        maxSize: 5 * 1024 * 1024,
        upload: uploadHandler,
        onError: (error: unknown) => console.error("Upload failed:", error),
    }),
    Placeholder.configure({
        placeholder,
    }),
    Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
    }),
];

export function MarkdownEditor({
    initialMarkdown = "",
    onUpdate,
    onEditorReady,
    placeholder = "Start typing...",
    className,
}: MarkdownEditorProps) {
    const uploadHandler = useConvexImageUpload();

    const editor = useEditor({
        extensions: createExtensions(placeholder, uploadHandler),
        content: initialMarkdown,
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
            },
        },
        onUpdate: ({ editor }) => {
            // tiptap-markdown stores API on storage.markdown
            // @ts-expect-error - storage type from extension
            const markdown = editor.storage.markdown.getMarkdown();
            onUpdate?.(markdown as string);
        },
        onCreate: ({ editor }) => {
            onEditorReady?.(editor);
        },
    });

    return (
        <div className={className}>
            <EditorContent editor={editor} />
        </div>
    );
}


