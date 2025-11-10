"use client";

import { mergeAttributes } from "@tiptap/core";
import { Heading } from "@tiptap/extension-heading";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

interface MarkdownViewerProps {
    markdown: string;
    className?: string;
}

const createExtensions = () => [
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
    Markdown.configure({
        html: true,
    }),
];

export function MarkdownViewer({ markdown, className }: MarkdownViewerProps) {
    const editor = useEditor({
        extensions: createExtensions(),
        content: markdown,
        editable: false,
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none",
            },
        },
    });

    return (
        <div className={className}>
            <EditorContent editor={editor} />
        </div>
    );
}


