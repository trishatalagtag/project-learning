import { CheckCircleIcon } from "@heroicons/react/24/outline"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

interface LearnerActionsProps {
  onMarkComplete: () => void
  isCompleted: boolean
  isLoading: boolean
}

export function LearnerActions({ onMarkComplete, isCompleted, isLoading }: LearnerActionsProps) {
  return (
    <ButtonGroup className="w-full">
      <Button
        variant={isCompleted ? "default" : "outline"}
        className="flex-1 gap-2"
        onClick={onMarkComplete}
        disabled={isLoading}
      >
        <CheckCircleIcon className={`h-4 w-4 ${isCompleted ? "fill-current" : ""}`} />
        {isCompleted ? "Completed" : "Mark as Complete"}
      </Button>
    </ButtonGroup>
  )
}
