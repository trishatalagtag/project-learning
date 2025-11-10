"use client"

import { Button } from "@/components/ui/button"
import { AutoSaveIndicator } from "../controls/auto-save-indicator"

interface EditModeHeaderProps {
  isSaving: boolean
  isDirty: boolean
  lastSaved: Date | null
  onSave: () => void
  onCancel: () => void
}

export function EditModeHeader({
  isSaving,
  isDirty,
  lastSaved,
  onSave,
  onCancel,
}: EditModeHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
          Save Now
        </Button>
      </div>
    </div>
  )
}
