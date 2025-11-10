import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface StatusValidationProps {
  message: string
}

export function StatusValidation({ message }: StatusValidationProps) {
  return (
    <Alert variant="destructive" className="mt-3">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertDescription className="text-xs ml-2">{message}</AlertDescription>
    </Alert>
  )
}
