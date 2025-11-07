import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileTrigger } from "@/components/ui/file-trigger"
import { useAvatarUpload } from "@/hooks/use-avatar-upload"
import { authClient } from "@/lib/auth"
import { getAvatarUrl, getInitials } from "@/lib/avatar"
import { CameraIcon } from "@heroicons/react/24/outline"
import { createFileRoute } from "@tanstack/react-router"
import { api } from "api"
import { useMutation } from "convex/react"
import { toast } from "sonner"

export const Route = createFileRoute("/settings/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session } = authClient.useSession()
  const { uploadAvatar, isUploading, previewUrl } = useAvatarUpload()
  const updateProfile = useMutation(api.shared.users.updateProfile)

  const handleAvatarSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const storageId = await uploadAvatar(files[0])

    if (storageId) {
      try {
        await updateProfile({ image: storageId })
        toast.success("Profile picture updated!")
      } catch (error) {
        toast.error("Failed to update profile", {
          description: `${error instanceof Error ? error.message : "Failed to update profile"}`,
        })
      }
    }
  }

  const currentAvatar = previewUrl || getAvatarUrl(session?.user || {})

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-bold text-3xl">Profile Settings</h1>
      <p className="mt-2 text-muted-fg">Manage your profile information</p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Avatar
          src={currentAvatar}
          alt={session?.user?.name || "User"}
          size="2xl"
          isSquare={false}
          initials={getInitials(session?.user?.name)}
        />

        <FileTrigger
          acceptedFileTypes={["image/*"]}
          allowsMultiple={false}
          onSelect={handleAvatarSelect}
        >
          <Button type="button" intent="secondary" isPending={isUploading}>
            <CameraIcon className="size-4" />
            {isUploading ? "Uploading..." : "Change Photo"}
          </Button>
        </FileTrigger>

        <p className="text-center text-muted-fg text-sm">
          {session?.user?.image ? "Custom photo" : "Auto-generated avatar"}
          <br />
          Upload JPG, PNG or GIF • Max 5MB
          <br />
          Recommended: Square image, at least 400x400px
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h3 className="font-semibold">Name</h3>
          <p className="text-muted-fg">{session?.user?.name}</p>
        </div>
        <div>
          <h3 className="font-semibold">Email</h3>
          <p className="text-muted-fg">{session?.user?.email}</p>
        </div>
        {session?.user?.role && (
          <div>
            <h3 className="font-semibold">Role</h3>
            <p className="text-muted-fg">{session?.user?.role}</p>
          </div>
        )}
      </div>
    </div>
  )
}
