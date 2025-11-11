import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useFileUrl(fileId: Id<"_storage"> | undefined) {
  const url = useQuery(
    api.shared.files.getFileUrl,
    fileId ? { fileId } : "skip"
  );

  return {
    url,
    isLoading: url === undefined,
    isNotFound: url === null,
  };
}

// Stub for file metadata - can be implemented when getFileMetadata query is added
export function useFileMetadata(fileId: Id<"_storage"> | undefined) {
  // TODO: Implement when getFileMetadata query is available
  return {
    metadata: null,
    isLoading: false,
    isNotFound: !fileId,
  };
}

