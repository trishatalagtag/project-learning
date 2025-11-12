import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"

import { Alert, AlertDescription } from "@/components/ui/alert"

interface StatusValidationWarningProps {
  message: string
}

export function StatusValidationWarning({ message }: StatusValidationWarningProps) {
  return (
    <Alert variant="destructive" className="mt-3">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertDescription className="ml-2 text-xs">{message}</AlertDescription>
    </Alert>
  )
}
