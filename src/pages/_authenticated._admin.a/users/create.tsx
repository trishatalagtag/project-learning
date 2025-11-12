import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ArrowLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/_admin/a/users/create")({
  component: CreateUserPage,
})

function CreateUserPage() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/a/users" })}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlusIcon className="h-12 w-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Create New User</EmptyTitle>
          <EmptyDescription>
            User creation functionality is coming soon. Users can currently
            register through the authentication system.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => navigate({ to: "/a/users" })}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
