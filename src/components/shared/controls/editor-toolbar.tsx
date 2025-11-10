"use client"

import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/tiptap-ui-primitive/toolbar"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover"
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { getEditorStats } from "@/lib/tiptap/extensions"
import type { Editor } from "@tiptap/react"
import { EditorContext } from "@tiptap/react"
import { useMemo } from "react"
import { AutoSaveIndicator } from "./auto-save-indicator"

// Uncomment if you have these components
// import { HorizontalRuleButton } from "@/components/tiptap-ui/horizontal-rule-button";
// import { TableDropdownMenu } from "@/components/tiptap-ui/table-dropdown-menu";

// ============================================================================
// Constants
// ============================================================================

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const
const LIST_TYPES = ["bulletList", "orderedList", "taskList"] as const
const TEXT_ALIGNS = ["left", "center", "right", "justify"] as const

// ============================================================================
// Types
// ============================================================================

export interface EditorToolbarConfig {
  /** Show heading controls */
  showHeadings?: boolean
  /** Show list controls */
  showLists?: boolean
  /** Show text formatting controls */
  showTextFormat?: boolean
  /** Show alignment controls */
  showAlignment?: boolean
  /** Show image upload */
  showImage?: boolean
  /** Show link controls */
  showLink?: boolean
  /** Show code blocks */
  showCodeBlock?: boolean
  /** Show blockquote */
  showBlockquote?: boolean
  /** Show superscript/subscript */
  showScripts?: boolean
  /** Show undo/redo */
  showUndoRedo?: boolean
  /** Show horizontal rule */
  showHorizontalRule?: boolean
  /** Show table controls */
  showTable?: boolean
  /** Show character count */
  showCharacterCount?: boolean
  /** Heading levels to show */
  headingLevels?: readonly number[]
}

export interface EditorToolbarProps {
  /** TipTap editor instance */
  editor: Editor | null
  /** Is content currently saving */
  isSaving?: boolean
  /** Has content changed since last save */
  isDirty?: boolean
  /** Last saved timestamp */
  lastSaved?: Date | null
  /** Save handler */
  onSave?: () => void
  /** Cancel handler */
  onCancel?: () => void
  /** Toolbar configuration */
  config?: EditorToolbarConfig
  /** Additional CSS classes */
  className?: string
  /** Show toolbar in compact mode */
  compact?: boolean
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_CONFIG: EditorToolbarConfig = {
  showHeadings: true,
  showLists: true,
  showTextFormat: true,
  showAlignment: true,
  showImage: true,
  showLink: true,
  showCodeBlock: true,
  showBlockquote: true,
  showScripts: true,
  showUndoRedo: true,
  showHorizontalRule: false,
  showTable: false,
  showCharacterCount: false,
  headingLevels: HEADING_LEVELS,
}

// ============================================================================
// Component
// ============================================================================

export function EditorToolbar({
  editor,
  isSaving = false,
  isDirty = false,
  lastSaved = null,
  onSave,
  onCancel,
  config = DEFAULT_CONFIG,
  className,
  compact = false,
}: EditorToolbarProps) {
  const isMobile = useIsMobile()
  const showEditControls = onSave !== undefined && onCancel !== undefined

  // Merge config with defaults
  const toolbarConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  // Get character count stats
  const stats = useMemo(() => {
    if (!editor || !toolbarConfig.showCharacterCount) return null
    return getEditorStats(editor)
  }, [editor, toolbarConfig.showCharacterCount])

  if (!editor) {
    return (
      <div className={`sticky top-0 z-50 rounded-b-lg bg-background ${className || ""}`}>
        <div className="px-2 py-2">
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className={`sticky top-0 z-50 rounded-b-lg border-b bg-background ${className || ""}`}>
        <div className={compact ? "px-1 py-1" : "px-2 py-2"}>
          <Toolbar aria-label="Editor formatting toolbar">
            {/* Save Controls */}
            {showEditControls && (
              <>
                <ToolbarGroup>
                  <div className="flex items-center px-2">
                    <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
                  </div>
                </ToolbarGroup>
                <ToolbarSeparator />
                <ToolbarGroup>
                  <Button
                    variant="outline"
                    size={compact ? "sm" : "default"}
                    onClick={onCancel}
                    disabled={isSaving}
                    className={compact ? "h-7 text-xs" : "h-8"}
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </Button>
                  <Button
                    size={compact ? "sm" : "default"}
                    onClick={onSave}
                    disabled={!isDirty || isSaving}
                    className={compact ? "h-7 min-w-[70px] text-xs" : "h-8 min-w-[80px]"}
                    aria-label={isSaving ? "Saving changes" : "Save changes"}
                  >
                    {isSaving ? "Saving..." : "Save Now"}
                  </Button>
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            <Spacer />

            {/* Undo/Redo */}
            {toolbarConfig.showUndoRedo && (
              <>
                <ToolbarGroup>
                  <UndoRedoButton action="undo" />
                  <UndoRedoButton action="redo" />
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            {/* Block Controls */}
            {(toolbarConfig.showHeadings ||
              toolbarConfig.showLists ||
              toolbarConfig.showBlockquote ||
              toolbarConfig.showCodeBlock) && (
              <>
                <ToolbarGroup>
                  {toolbarConfig.showHeadings && (
                    <HeadingDropdownMenu
                      levels={toolbarConfig.headingLevels as any}
                      portal={isMobile}
                    />
                  )}
                  {toolbarConfig.showLists && (
                    <ListDropdownMenu types={[...LIST_TYPES]} portal={isMobile} />
                  )}
                  {toolbarConfig.showBlockquote && <BlockquoteButton />}
                  {toolbarConfig.showCodeBlock && <CodeBlockButton />}
                  {/* Uncomment when you have this component */}
                  {/* {toolbarConfig.showHorizontalRule && <HorizontalRuleButton />} */}
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            {/* Text Formatting */}
            {toolbarConfig.showTextFormat && (
              <>
                <ToolbarGroup>
                  <MarkButton type="bold" />
                  <MarkButton type="italic" />
                  <MarkButton type="strike" />
                  <MarkButton type="code" />
                  <MarkButton type="underline" />
                  <ColorHighlightPopover />
                  {toolbarConfig.showLink && <LinkPopover />}
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            {/* Subscript/Superscript */}
            {toolbarConfig.showScripts && (
              <>
                <ToolbarGroup>
                  <MarkButton type="superscript" />
                  <MarkButton type="subscript" />
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            {/* Text Alignment */}
            {toolbarConfig.showAlignment && (
              <>
                <ToolbarGroup>
                  {TEXT_ALIGNS.map((align) => (
                    <TextAlignButton key={align} align={align} />
                  ))}
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            {/* Table Controls */}
            {/* Uncomment when you have this component */}
            {/* {toolbarConfig.showTable && (
                            <>
                                <ToolbarGroup>
                                    <TableDropdownMenu portal={isMobile} />
                                </ToolbarGroup>
                                <ToolbarSeparator />
                            </>
                        )} */}

            {/* Image Upload */}
            {toolbarConfig.showImage && (
              <>
                <ToolbarGroup>
                  <ImageUploadButton text={compact ? undefined : "Image"} />
                </ToolbarGroup>
                <ToolbarSeparator />
              </>
            )}

            {/* Character Count */}
            {toolbarConfig.showCharacterCount && stats && (
              <>
                <ToolbarGroup>
                  <div className="flex items-center gap-2 px-2 text-muted-foreground text-xs">
                    <span>
                      {stats.characters.toLocaleString()}
                      {stats.limit && ` / ${stats.limit.toLocaleString()}`}
                    </span>
                    {stats.percentage !== null && (
                      <span className={stats.percentage > 90 ? "font-medium text-destructive" : ""}>
                        ({stats.percentage}%)
                      </span>
                    )}
                  </div>
                </ToolbarGroup>
              </>
            )}

            <Spacer />
          </Toolbar>
        </div>
      </div>
    </EditorContext.Provider>
  )
}

// ============================================================================
// Preset Configs
// ============================================================================

export const TOOLBAR_PRESETS = {
  /** Full featured editor */
  full: DEFAULT_CONFIG,

  /** Minimal formatting only */
  minimal: {
    showHeadings: false,
    showLists: true,
    showTextFormat: true,
    showAlignment: false,
    showImage: false,
    showLink: true,
    showCodeBlock: false,
    showBlockquote: false,
    showScripts: false,
    showUndoRedo: true,
  } as EditorToolbarConfig,

  /** Blog post editor */
  blog: {
    showHeadings: true,
    showLists: true,
    showTextFormat: true,
    showAlignment: true,
    showImage: true,
    showLink: true,
    showCodeBlock: true,
    showBlockquote: true,
    showScripts: false,
    showUndoRedo: true,
    showCharacterCount: true,
    headingLevels: [1, 2, 3],
  } as EditorToolbarConfig,

  /** Documentation editor */
  docs: {
    showHeadings: true,
    showLists: true,
    showTextFormat: true,
    showAlignment: false,
    showImage: true,
    showLink: true,
    showCodeBlock: true,
    showBlockquote: true,
    showScripts: false,
    showUndoRedo: true,
    showTable: true,
    headingLevels: [1, 2, 3, 4],
  } as EditorToolbarConfig,

  /** Comment/reply editor */
  comment: {
    showHeadings: false,
    showLists: false,
    showTextFormat: true,
    showAlignment: false,
    showImage: false,
    showLink: true,
    showCodeBlock: true,
    showBlockquote: false,
    showScripts: false,
    showUndoRedo: true,
    showCharacterCount: true,
  } as EditorToolbarConfig,
} as const
