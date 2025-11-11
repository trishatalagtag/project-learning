import { UserCoursesTab } from "@/components/admin/users/user-detail/user-courses-tab"
import { UserEnrollmentsTab } from "@/components/admin/users/user-detail/user-enrollments-tab"
import { UserProfileCard } from "@/components/admin/users/user-detail/user-profile-card"
import { UserStatsCard } from "@/components/admin/users/user-detail/user-stats-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import { ArrowLeftIcon, UserIcon } from "@heroicons/react/24/outline"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { Loader2 } from "lucide-react"

export const Route = createFileRoute("/_authenticated/_admin/a/users/$userId")({
  beforeLoad: ({ params }) => ({
    breadcrumb: `User: ${params.userId}`,
  }),
  component: UserDetailPage,
  notFoundComponent: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserIcon className="h-12 w-12 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>User not found</EmptyTitle>
        <EmptyDescription>
          The user you're looking for doesn't exist or has been removed.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <a href="/a/users">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Users
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  ),
})

function UserDetailPage() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()

  console.log("Loading user with ID:", userId) // Debug log

  // Live query for real-time updates
  const user = useQuery(api.admin.users.getUserById, { authUserId: userId })

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (user === null) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserIcon className="h-12 w-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>User not found</EmptyTitle>
          <EmptyDescription>
            The user you're looking for doesn't exist or has been removed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => navigate({ to: "/a/users" })}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  // Transform user data to match User interface
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: (user.role || "LEARNER") as "ADMIN" | "FACULTY" | "LEARNER",
    image: user.image,
    institution: user.institution,
    bio: user.bio,
    emailVerified: user.emailVerified,
    isDeactivated: false, // TODO: Add isDeactivated to backend response
    enrolledCoursesCount: user.enrolledCoursesCount,
    createdCoursesCount: user.createdCoursesCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  const isFacultyOrAdmin = userData.role === "FACULTY" || userData.role === "ADMIN"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/a/users" })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>

      {/* Profile Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UserProfileCard user={userData} />
        </div>
        <div className="space-y-6 lg:col-span-1">
          <UserStatsCard user={userData} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="enrollments">
        <TabsList>
          <TabsTrigger value="enrollments">
            Enrollments ({userData.enrolledCoursesCount})
          </TabsTrigger>
          {isFacultyOrAdmin && (
            <TabsTrigger value="courses">
              Created Courses ({userData.createdCoursesCount || 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="enrollments" className="mt-6">
          <UserEnrollmentsTab userId={userId} />
        </TabsContent>

        {isFacultyOrAdmin && (
          <TabsContent value="courses" className="mt-6">
            <UserCoursesTab userId={userId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
