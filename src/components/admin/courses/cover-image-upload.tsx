"use client"

import { ArrowUpTrayIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface CoverImageUploadProps {
  courseId: Id<"courses">
  currentImageUrl?: string
  onSuccess?: () => void
}

export function CoverImageUpload({ courseId, currentImageUrl, onSuccess }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateUploadUrl = useMutation(api.shared.files.generateUploadUrl)
  const updateCourse = useMutation(api.faculty.courses.updateCourse)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const postUrl = await generateUploadUrl()

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      })

      if (!result.ok) {
        throw new Error("Upload failed")
      }

      const { storageId } = await result.json()

      await updateCourse({
        courseId,
        coverImageId: storageId as Id<"_storage">,
      })

      toast.success("Cover image updated successfully")
      setSelectedFile(null)
      onSuccess?.()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(currentImageUrl || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Label>Cover Image</Label>

      {previewUrl ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
          <img src={previewUrl} alt="Cover preview" className="h-full w-full object-cover" />
          {selectedFile && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50">
              <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isUploading}>
                <XMarkIcon className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-video w-full max-w-md items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center gap-2 text-center">
            <PhotoIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No cover image</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
          {previewUrl ? "Change Image" : "Upload Image"}
        </Button>
      </div>
    </div>
  )
}
