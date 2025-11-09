import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Link } from "@tanstack/react-router"
import { AlertTriangleIcon } from "lucide-react"

export function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon className="text-yellow-600" />
          </EmptyMedia>
          <EmptyTitle className="text-gray-900">404: Page Not Found</EmptyTitle>
          <EmptyDescription className="text-gray-700">
            The page you are looking for does not exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
