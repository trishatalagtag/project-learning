import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const generateUploadUrl = useMutation(api.shared.files.generateUploadUrl)
  const validateFile = useMutation(api.shared.files.validateFile)

  const uploadAvatar = async (file: File): Promise<Id<"_storage"> | null> => {
    // Validate file size (5MB for avatars)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Avatar must be under 5MB",
      })
      return null
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file",
      })
      return null
    }

    setIsUploading(true)

    try {
      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl()

      // Step 2: Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!result.ok) {
        throw new Error("Upload failed")
      }

      const { storageId } = await result.json()

      // Step 3: Validate uploaded file
      const validation = await validateFile({
        fileId: storageId,
        expectedType: "image",
      })

      if (!validation.valid) {
        throw new Error(validation.error || "File validation failed")
      }

      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      toast.success("Photo uploaded successfully!")
      return storageId as Id<"_storage">
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Please try again",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const clearPreview = () => {
    setPreviewUrl(null)
  }

  return {
    uploadAvatar,
    isUploading,
    previewUrl,
    clearPreview,
  }
}
