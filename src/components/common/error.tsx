import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { ConvexError } from "convex/values"
import { AlertTriangleIcon, LockIcon } from "lucide-react"

export function _CustomErrorComponent({ error, reset }: ErrorComponentProps) {
  if (error instanceof ConvexError && error.message.includes("not authenticated")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Empty className="max-w-md border-red-200 bg-red-50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LockIcon className="text-red-600" />
            </EmptyMedia>
            <EmptyTitle className="text-red-900">Authentication Required</EmptyTitle>
            <EmptyDescription className="text-red-700">
              You need to be logged in to access this page.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="destructive">
              <Link to="/">Go Home</Link>
            </Button>
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              <Link to="/">Login</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="default">
            <AlertTriangleIcon />
          </EmptyMedia>
          <EmptyTitle className="text-gray-900">Something went wrong</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <details className="mt-2">
            <summary className="cursor-pointer font-medium text-gray-700 text-sm">
              Error Details
            </summary>
            <pre className="mt-2 overflow-auto break-words rounded bg-gray-100 p-3 text-xs">
              {error.message}
            </pre>
          </details>
          <Button type="button" onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
