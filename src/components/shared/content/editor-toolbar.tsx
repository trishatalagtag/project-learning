"use client";

import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar";
import { EditorContext } from "@tiptap/react";

import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

import { useIsMobile } from "@/hooks/use-mobile";

const HEADING_LEVELS = [1, 2, 3, 4] as const;
const LIST_TYPES = ["bulletList", "orderedList", "taskList"] as const;

interface EditorToolbarProps {
    editor: any;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    const isMobile = useIsMobile();

    if (!editor) return null;

    return (
        <EditorContext.Provider value={{ editor }}>
            <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
                <Toolbar>
                    <Spacer />

                    <ToolbarGroup>
                        <UndoRedoButton action="undo" />
                        <UndoRedoButton action="redo" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <HeadingDropdownMenu levels={[...HEADING_LEVELS]} portal={isMobile} />
                        <ListDropdownMenu types={[...LIST_TYPES]} portal={isMobile} />
                        <BlockquoteButton />
                        <CodeBlockButton />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <MarkButton type="bold" />
                        <MarkButton type="italic" />
                        <MarkButton type="strike" />
                        <MarkButton type="code" />
                        <MarkButton type="underline" />
                        <ColorHighlightPopover />
                        <LinkPopover />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <MarkButton type="superscript" />
                        <MarkButton type="subscript" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <TextAlignButton align="left" />
                        <TextAlignButton align="center" />
                        <TextAlignButton align="right" />
                        <TextAlignButton align="justify" />
                    </ToolbarGroup>

                    <ToolbarSeparator />

                    <ToolbarGroup>
                        <ImageUploadButton text="Image" />
                    </ToolbarGroup>

                    <Spacer />
                </Toolbar>
            </div>
        </EditorContext.Provider>
    );
}


