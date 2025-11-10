import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

interface ContentActionBarProps {
  isEditMode: boolean
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  isDirty?: boolean
  extraActions?: ReactNode
}

export function ContentActionBar({
  isEditMode,
  onSave,
  onCancel,
  isSaving,
  isDirty = true,
  extraActions,
}: ContentActionBarProps) {
  if (!isEditMode) {
    return extraActions ? <div className="flex items-center gap-2">{extraActions}</div> : null
  }

  return (
    <div className="flex items-center gap-2">
      {extraActions}
      <Button onClick={onCancel} variant="outline" size="sm" disabled={isSaving}>
        Cancel
      </Button>
      <Button onClick={onSave} size="sm" disabled={isSaving || !isDirty}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  )
}
