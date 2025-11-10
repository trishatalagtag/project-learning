// lib/tiptap/types.ts

// Unified TOC type that matches TipTap's extension output
export interface TocItem {
  id: string;
  textContent: string; // Changed from 'text' to match TipTap
  level: number;
  itemIndex: number;
  isActive: boolean;
  isScrolledOver: boolean;
}

export type TocUpdateCallback = (items: TocItem[]) => void;

export interface TipTapExtensionOptions {
  placeholder?: string;
  uploadHandler?: (file: File) => Promise<string>;
  onTocUpdate?: TocUpdateCallback;
  enableImageUpload?: boolean;
  enableCollaboration?: boolean;
  maxCharacters?: number;
  enableMath?: boolean;
  enableTables?: boolean;
  enableTaskLists?: boolean;
  scrollContainerSelector?: string;
  headingLevels?: Array<1 | 2 | 3 | 4 | 5 | 6>; // Proper Level type
  textAlignTypes?: string[];
  maxImageSize?: number;
}

export interface BaseEditorProps {
  className?: string;
  onTocUpdate?: TocUpdateCallback;
  editorClassName?: string;
}